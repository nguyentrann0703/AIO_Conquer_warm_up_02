import React from "react";
import styled from "styled-components";
import GlitchButton from "./GlitchButton";
import GlitchText from "./GlitchText";

const RightHeroSection = () => {
  return (
    <StyledWrapper className="w-fit">
      <section className="container w-fit">
        <div className="card-container w-fit">
          <div className="card-content h-180 w-230!">
            <div className="card-body ml-8 h-180! w-240! p-16 rounded-lg md:w-1/2 z-10 space-y-8">
              <div className="space-y-2">
                <GlitchText />
                <h1 className="text-6xl font-headline md:text-8xl text-left tracking-tighter leading-none uppercase">
                  <span className="text-primary italic">RISK ENGINE</span>
                </h1>
              </div>
              <p className="max-w-md text-left text-on-background font-body font-medium text-lg leading-relaxed border-l-2 border-primary/30 pl-6">
                Predicting logistics anomalies before they occur. Utilize our
                neural pathway to determine shipping friction and operational
                bottlenecks in real-time.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <GlitchButton />
              </div>
            </div>
          </div>
        </div>
      </section>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container {
    font-family: var(--font-body);
    font-style: italic;
    font-weight: bold;
    width: fit-content;
    display: flex;
    margin: auto;
    aspect-ratio: 16/9;
    align-items: center;
    justify-items: center;
    justify-content: center;
    flex-wrap: wrap;
    flex-direction: column;
    gap: 1em;
  }

  .card-container {
    width: fit-content;
    filter: drop-shadow(46px 36px 24px var(--secondary))
      drop-shadow(-55px -40px 25px var(--tertiary));
    animation: blinkShadowsFilter 8s ease-in infinite;
  }

  .card-content {
    width: fit-content;
    display: grid;
    align-content: center;
    justify-items: center;
    align-items: center;
    text-align: center;
    padding: 1em;
    grid-template-rows: 0.1fr 0.7fr 0.25fr;
    background-color: var(--surface-container-low);
    width: 10em;
    aspect-ratio: 9/16;
    -webkit-clip-path: polygon(
      0 0,
      85% 0,
      100% 14%,
      100% 60%,
      92% 65%,
      93% 77%,
      99% 80%,
      99% 90%,
      89% 100%,
      0 100%
    );
    clip-path: polygon(
      0 0,
      85% 0,
      100% 14%,
      100% 60%,
      92% 65%,
      93% 77%,
      99% 80%,
      99% 90%,
      89% 100%,
      0 100%
    );
  }

  .card-content::before {
    content: "";
    position: absolute;
    width: 250%;
    aspect-ratio: 1/1;
    transform-origin: center;
    background:
      linear-gradient(
        to bottom,
        transparent,
        transparent,
        var(--secondary),
        var(--secondary),
        var(--tertiary),
        var(--tertiary),
        transparent,
        transparent
      ),
      linear-gradient(
        to left,
        transparent,
        transparent,
        var(--secondary),
        var(--secondary),
        var(--tertiary),
        var(--tertiary),
        transparent,
        transparent
      );
    animation: rotate 5s infinite linear;
  }

  .card-content::after {
    content: "";
    position: absolute;
    top: 1%;
    left: 1%;
    width: 98%;
    height: 98%;
    background:
      repeating-linear-gradient(
        to bottom,
        transparent 0%,
        color-mix(in srgb, var(--secondary) 60%, transparent) 1px,
        var(--surface-container-lowest) 3px,
        color-mix(in srgb, var(--secondary) 30%, transparent) 5px,
        var(--secondary-container) 4px,
        transparent 0.5%
      ),
      repeating-linear-gradient(
        to left,
        var(--surface-container) 100%,
        color-mix(in srgb, var(--surface-container) 99%, transparent) 100%
      );
    box-shadow: inset 0px 0px 30px 40px var(--surface-container-low);
    -webkit-clip-path: polygon(
      0 0,
      85% 0,
      100% 14%,
      100% 60%,
      92% 65%,
      93% 77%,
      99% 80%,
      99% 90%,
      89% 100%,
      0 100%
    );
    clip-path: polygon(
      0 0,
      85% 0,
      100% 14%,
      100% 60%,
      92% 65%,
      93% 77%,
      99% 80%,
      99% 90%,
      89% 100%,
      0 100%
    );
    animation: backglitch 94ms linear infinite;
  }

  .card-body {
    padding-block: 1.5em;
    padding-inline: 1em;
    z-index: 80;
    display: flex;
    height: 700px;
    gap: 1.5em;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
  }

  .card-footer {
    padding-inline: 1em;
  }

  @keyframes backglitch {
    0% {
      box-shadow: inset 0px 20px 30px 40px var(--surface-container-low);
    }

    50% {
      box-shadow: inset 0px -20px 30px 40px var(--surface-container);
    }

    to {
      box-shadow: inset 0px 20px 30px 40px var(--surface-container-low);
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg) translate(-50%, 20%);
    }

    50% {
      transform: rotate(180deg) translate(40%, 10%);
    }

    to {
      transform: rotate(360deg) translate(-50%, 20%);
    }
  }

  @keyframes blinkShadowsFilter {
    0% {
      filter: drop-shadow(
          46px 36px 28px color-mix(in srgb, var(--secondary) 34%, transparent)
        )
        drop-shadow(-55px -40px 28px var(--tertiary));
    }

    25% {
      filter: drop-shadow(
          46px -36px 24px color-mix(in srgb, var(--secondary) 90%, transparent)
        )
        drop-shadow(-55px 40px 24px var(--tertiary));
    }

    50% {
      filter: drop-shadow(
          46px 36px 30px color-mix(in srgb, var(--secondary) 90%, transparent)
        )
        drop-shadow(
          -55px 40px 30px color-mix(in srgb, var(--tertiary) 29%, transparent)
        );
    }

    75% {
      filter: drop-shadow(
          20px -18px 25px color-mix(in srgb, var(--secondary) 90%, transparent)
        )
        drop-shadow(
          -20px 20px 25px color-mix(in srgb, var(--tertiary) 29%, transparent)
        );
    }

    to {
      filter: drop-shadow(
          46px 36px 28px color-mix(in srgb, var(--secondary) 34%, transparent)
        )
        drop-shadow(-55px -40px 28px var(--tertiary));
    }
  } /*# sourceMappingURL=style.css.map */
`;

export default RightHeroSection;
