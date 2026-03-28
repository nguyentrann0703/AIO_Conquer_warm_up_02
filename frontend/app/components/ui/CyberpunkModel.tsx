"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface CyberpunkModelProps {
	modelPath?: string;
	visible?: boolean;
	className?: string;
	onLoaded?: () => void;
	autoRotate?: boolean;
	rotationSpeed?: number;
	autoPlayAnimations?: boolean;
}

const CyberpunkModel = ({
	modelPath = "/3d-models/cybermodel.glb",
	visible = true,
	className,
	onLoaded,
	autoRotate = false,
	rotationSpeed = 0.0035,
	autoPlayAnimations = true,
}: CyberpunkModelProps) => {
	const mountRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const mountElement = mountRef.current;
		if (!mountElement) {
			return;
		}

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: "high-performance",
		});

		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(0x000000, 0);
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.15;
		mountElement.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);

		// TODO: Please provide your preferred cinematic setup values:
		// - Camera position (x, y, z), FOV, near/far, and lookAt target
		// - Model transform: position/rotation/scale (or desired facing direction)
		// - Lighting rig: ambient/key/fill/rim colors, intensity, and direction
		// - Optional HDRI/environment texture for reflections
		// - Optional post effects (bloom, vignette), if you want a cinematic look
		camera.position.set(0, 6, 2);
		camera.lookAt(0, 0.9, 0);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
		scene.add(ambientLight);

		const hemisphereLight = new THREE.HemisphereLight(0xa7d8ff, 0x1e1206, 0.7);
		scene.add(hemisphereLight);

		const keyLight = new THREE.DirectionalLight(0x9bc4ff, 1.8);
		keyLight.position.set(2.4, 3.5, 2.2);
		scene.add(keyLight);

		const rimLight = new THREE.DirectionalLight(0xffa347, 1.1);
		rimLight.position.set(-2.5, 2.2, -2.8);
		scene.add(rimLight);

		const loader = new GLTFLoader();
		let animationFrameId = 0;
		let modelRoot: THREE.Object3D | null = null;
		let mixer: THREE.AnimationMixer | null = null;
		const clock = new THREE.Timer();

		const setSize = () => {
			if (!mountElement) {
				return;
			}

			const width = mountElement.clientWidth || 1;
			const height = mountElement.clientHeight || 1;

			renderer.setSize(width, height, false);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		};

		loader.load(
			modelPath,
			(gltf) => {
				modelRoot = gltf.scene;

				// Auto-center and auto-frame so any GLB scale/origin still appears on screen.
				const modelBounds = new THREE.Box3().setFromObject(modelRoot);
				const modelSize = modelBounds.getSize(new THREE.Vector3());
				const modelCenter = modelBounds.getCenter(new THREE.Vector3());

				modelRoot.position.sub(modelCenter);

				const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z) || 1;
				const halfFov = THREE.MathUtils.degToRad(camera.fov * 0.5);
				const fitHeightDistance = maxDim / (2 * Math.tan(halfFov));
				const fitWidthDistance = fitHeightDistance / Math.max(camera.aspect, 0.01);
				const fitDistance = 1.2 * Math.max(fitHeightDistance, fitWidthDistance);

				camera.position.set(0, modelSize.y * 0.12, fitDistance);
				camera.near = Math.max(0.01, fitDistance / 100);
				camera.far = Math.max(1000, fitDistance * 100);
				camera.lookAt(0, 0, 0);
				camera.updateProjectionMatrix();

				scene.add(modelRoot);

				if (autoPlayAnimations && gltf.animations.length > 0) {
					mixer = new THREE.AnimationMixer(modelRoot);

					for (const clip of gltf.animations) {
						const action = mixer.clipAction(clip);
						action.reset();
						action.play();
					}
				}

				onLoaded?.();
			},
			undefined,
			(error) => {
				console.error("Failed to load model:", error);
			},
		);

		const animate = () => {
			animationFrameId = window.requestAnimationFrame(animate);

			if (mixer) {
				mixer.update(clock.getDelta());
			}

			if (modelRoot && autoRotate) {
				modelRoot.rotation.y += rotationSpeed;
			}

			renderer.render(scene, camera);
		};

		setSize();
		animate();

		window.addEventListener("resize", setSize);

		return () => {
			window.removeEventListener("resize", setSize);
			window.cancelAnimationFrame(animationFrameId);
			renderer.dispose();
			mixer?.stopAllAction();

			if (mountElement.contains(renderer.domElement)) {
				mountElement.removeChild(renderer.domElement);
			}

			scene.traverse((object) => {
				const mesh = object as THREE.Mesh;

				if (mesh.geometry) {
					mesh.geometry.dispose();
				}

				const material = mesh.material;

				if (Array.isArray(material)) {
					material.forEach((entry) => entry.dispose());
				} else if (material) {
					material.dispose();
				}
			});
		};
	}, [autoPlayAnimations, autoRotate, modelPath, onLoaded, rotationSpeed]);

	return (
		<div
			ref={mountRef}
			className={`pointer-events-none absolute inset-0 transition-all duration-1400 ease-out ${
				visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
			} ${className ?? ""}`}
		/>
	);
};

export default CyberpunkModel;
