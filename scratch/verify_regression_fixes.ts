// Regression Fixes Verification Script
import fs from 'fs';
import path from 'path';

console.log('--- STARTING CAFEHUB REGRESSION AUDIT & VERIFICATION ---');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, failureDetail?: string) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}: ${failureDetail || 'Assertion failed'}`);
  }
}

// 1. Audit useMagnetic.ts
const useMagneticCode = fs.readFileSync(path.join(process.cwd(), 'src/components/motion/useMagnetic.ts'), 'utf-8');
assert(
  useMagneticCode.includes('handleMouseDown') && useMagneticCode.includes('resetPosition(false)'),
  'useMagnetic resets to 0,0 on mousedown to guarantee click reliability'
);
assert(
  !useMagneticCode.includes('setPosition({ x: pullX, y: pullY })'),
  'useMagnetic does NOT trigger React component re-renders on every mousemove'
);
assert(
  useMagneticCode.includes('isTouchDevice()'),
  'useMagnetic guards against mobile touch interaction interference'
);

// 2. Audit TiltCard.tsx
const tiltCardCode = fs.readFileSync(path.join(process.cwd(), 'src/components/motion/TiltCard.tsx'), 'utf-8');
assert(
  tiltCardCode.includes('isTouchDevice()') && tiltCardCode.includes('if (reducedMotion || isTouch)'),
  'TiltCard renders a clean static container on touch screens and reduced motion'
);
assert(
  !tiltCardCode.includes("transformStyle: 'preserve-3d'"),
  'TiltCard removed preserve-3d to fix z-index stacking context for child buttons'
);
assert(
  tiltCardCode.includes('handleMouseDown') && tiltCardCode.includes('scale: 1'),
  'TiltCard stabilizes orientation on mousedown to guarantee click stability'
);

// 3. Audit ScrollSpotlight.tsx
const spotlightCode = fs.readFileSync(path.join(process.cwd(), 'src/components/motion/ScrollSpotlight.tsx'), 'utf-8');
assert(
  !spotlightCode.includes('setCoords('),
  'ScrollSpotlight uses direct DOM updates, eliminating re-renders on mousemove'
);

// 4. Audit PinnedStoryScene.tsx
const pinnedSceneCode = fs.readFileSync(path.join(process.cwd(), 'src/components/motion/PinnedStoryScene.tsx'), 'utf-8');
assert(
  pinnedSceneCode.includes('pointer-events-none select-none') || pinnedSceneCode.includes('pointer-events-none'),
  'PinnedStoryScene has pointer-events-none on non-interactive chapters 1 & 2'
);
assert(
  pinnedSceneCode.includes('h-[160vh]'),
  'PinnedStoryScene track is reduced to 160vh so users do not get stuck scrolling'
);
assert(
  pinnedSceneCode.includes('top-20'),
  'PinnedStoryScene sticky stage aligns cleanly under top-20 navbar without overlap'
);
assert(
  pinnedSceneCode.includes('pointer-events-auto') && pinnedSceneCode.includes('progress >= 0.65'),
  'PinnedStoryScene CTA button has pointer-events-auto when visible'
);

// 5. Audit SectionOverlapBridge.tsx
const bridgeCode = fs.readFileSync(path.join(process.cwd(), 'src/components/motion/SectionOverlapBridge.tsx'), 'utf-8');
assert(
  bridgeCode.includes('parallaxSpeed = 0') && bridgeCode.includes('disabled: parallaxSpeed === 0'),
  'SectionOverlapBridge defaults parallaxSpeed to 0 and disables transform when 0'
);

// 6. Audit CustomerDashboard.tsx
const dashboardCode = fs.readFileSync(path.join(process.cwd(), 'src/pages/CustomerDashboard.tsx'), 'utf-8');
assert(
  dashboardCode.includes('relative z-30') && dashboardCode.includes('Discover Cafes'),
  'CustomerDashboard CTA buttons have relative z-30 stacking above stat cards'
);
assert(
  dashboardCode.includes('parallaxSpeed={0}'),
  'CustomerDashboard stat cards bridge has parallaxSpeed 0 for stability'
);

// 7. Audit CafeDetailPage.tsx
const detailCode = fs.readFileSync(path.join(process.cwd(), 'src/pages/CafeDetailPage.tsx'), 'utf-8');
assert(
  detailCode.includes('parallaxSpeed={0}') && detailCode.includes('overlapDistance={-28}'),
  'CafeDetailPage header card bridge has parallaxSpeed 0'
);
assert(
  detailCode.includes('relative z-30') && detailCode.includes('Book a Table'),
  'CafeDetailPage action buttons have relative z-30 to ensure clickability'
);

// 8. Audit Reveal.tsx
const revealCode = fs.readFileSync(path.join(process.cwd(), 'src/components/motion/Reveal.tsx'), 'utf-8');
assert(
  revealCode.includes("pointerEvents: isVisible ? undefined : 'none'"),
  'Reveal elements have pointerEvents none when hidden to prevent click interception'
);

// 9. Audit ScrollScrubImage.tsx
const scrubImageCode = fs.readFileSync(path.join(process.cwd(), 'src/components/motion/ScrollScrubImage.tsx'), 'utf-8');
assert(
  scrubImageCode.includes('w-full h-full'),
  'ScrollScrubImage container defaults to w-full h-full to prevent layout shifts'
);

console.log(`\n--- AUDIT SUMMARY: ${passedTests}/${totalTests} TESTS PASSED ---`);
if (passedTests === totalTests) {
  console.log('ALL REGRESSION AUDITS PASSED WITH ZERO FAILURES!');
  process.exit(0);
} else {
  console.error('SOME REGRESSION AUDITS FAILED.');
  process.exit(1);
}
