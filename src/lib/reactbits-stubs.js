// Stubs for @appletosolutions/reactbits peer dependencies not installed.
// The barrel file statically imports all peer deps at top level.
// These stubs provide valid (dummy) exports to prevent build/runtime errors.

// --- Paid GSAP plugins (not in free gsap package) ---
export class SplitText {
  constructor() {}
  split() { return { chars: [], words: [], lines: [] }; }
}
export const ScrambleTextPlugin = {};
export class Observer {}
export class InertiaPlugin {}

// --- matter-js ---
const MatterJs = { Engine: { create: () => ({}), update: () => {} } };
export default MatterJs;

// --- Helpers ---
const StubClass = class {};
const StubObj = {};

// --- three ---
export const Color = StubClass;
export const Object3D = StubClass;
export const Vector2 = StubClass;
export const Vector3 = StubClass;
export const Vector4 = StubClass;
export const MathUtils = { clamp: (v, min, max) => Math.min(Math.max(v, min), max), degToRad: (d) => d * Math.PI / 180 };
export const ACESFilmicToneMapping = 0;
export const Raycaster = StubClass;
export const Plane = StubClass;
export const Clock = StubClass;
export const InstancedMesh = StubClass;
export const PMREMGenerator = StubClass;
export const SphereGeometry = StubClass;
export const MeshPhysicalMaterial = StubClass;
export const MeshStandardMaterial = StubClass;
export const MeshBasicMaterial = StubClass;
export const ShaderChunk = StubObj;
export const ShaderLib = StubObj;
export const UniformsUtils = { clone: (u) => u, merge: (a) => a };
export const PerspectiveCamera = StubClass;
export const OrthographicCamera = StubClass;
export const Scene = StubClass;
export const WebGLRenderer = StubClass;
export const SRGBColorSpace = "";
export const AmbientLight = StubClass;
export const PointLight = StubClass;
export const DirectionalLight = StubClass;
export const Texture = StubClass;
export const CanvasTexture = StubClass;
export const DataTexture = StubClass;
export const ShaderMaterial = StubClass;
export const PlaneGeometry = StubClass;
export const BufferGeometry = StubClass;
export const BufferAttribute = StubClass;
export const InstancedBufferGeometry = StubClass;
export const InstancedBufferAttribute = StubClass;
export const TubeGeometry = StubClass;
export const LineCurve3 = StubClass;
export const NearestFilter = 0;
export const LinearFilter = 0;
export const ClampToEdgeWrapping = 0;
export const RepeatWrapping = 0;
export const Box3 = StubClass;
export const Sphere = StubClass;
export const Uniform = StubClass;
export const DoubleSide = 0;
export const Fog = StubClass;
export const LoadingManager = StubClass;
export const TextureLoader = StubClass;
export const RGBAFormat = 0;
export const FloatType = 0;
export const degToRad = (d) => d * Math.PI / 180;
export const RoomEnvironment = StubClass;

// --- @react-three/fiber ---
export const Canvas = "canvas";
export const useThree = () => ({});
export const invalidate = () => {};
export const useLoader = () => ({});
export const useFrame = () => {};

// --- @react-three/drei ---
export const shaderMaterial = () => ({});
export const useTrailTexture = () => ({});
export const useGLTF = () => ({});
export const Environment = () => null;
export const ContactShadows = () => null;
export const useFBX = () => ({});
export const useProgress = () => ({ progress: 100 });
export const Html = () => null;
export const OrbitControls = () => null;

// --- @react-three/postprocessing ---
export const EffectComposer = class {};
export const wrapEffect = (e) => e;

// --- ogl ---
export const Renderer = class {};
export const Transform = class {};
export const Vec3 = class {};
export const Polyline = class {};
export const Camera = class {};
export const Triangle = class {};
export const Program = class {};
export const Mesh = class {};
export const Geometry = class {};

// --- three-stdlib ---
export const OBJLoader = class {};

// --- gl-matrix ---
export const mat4 = { create: () => [], identity: (m) => m };
export const vec2 = { create: () => [], set: (a, x, y) => a };
export const vec3 = { create: () => [], set: (a, x, y, z) => a };
export const quat = { create: () => [], identity: (q) => q };

// --- postprocessing ---
export const Effect = class {};
export const RenderPass = class {};
export const EffectPass = class {};
export const BloomEffect = class {};
export const SMAAEffect = class {};
export const SMAAPreset = {};

// --- @chakra-ui/react ---
export const Icon = () => null;

// --- react-icons (for safety, though they should be installed) ---
// (these come from the react-icons dependency of reactbits)
