import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere } from '@react-three/drei';
import { Suspense } from 'react';

export const SpaceScene = () => {
  return (
    <div className='w-full mb-8 overflow-hidden border border-gray-700 rounded-lg h-96'>
      <Canvas>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />

          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
          />

          <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
            <meshStandardMaterial color='#3498db' />
          </Sphere>

          <Sphere args={[0.4, 32, 32]} position={[2, 1, 0]}>
            <meshStandardMaterial color='#e74c3c' />
          </Sphere>

          <OrbitControls
            autoRotate
            autoRotateSpeed={0.5}
            enableZoom={true}
            enablePan={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
