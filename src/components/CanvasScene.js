"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PlaneGeometry } from 'three';

// Extend Three.js objects to be used declaratively in react-three-fiber
extend({ PlaneGeometry });

const GridBackground = () => {
  const meshRef = useRef();

  // const texture = useTexture('/images/grid-background.png');

  // useEffect(() => {
  //   if (texture) {
  //     texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  //     texture.repeat.set(50, 50);
  //     meshRef.current.material.map = texture;
  //     meshRef.current.material.needsUpdate = true;
  //   }
  // }, [texture]);

  return (
    <mesh ref={meshRef} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial />
    </mesh>
  );
};

const PlatformBackground = () => {
  const meshRef = useRef();
  // const texture = useTexture('/images/platform-background.png');

  // useEffect(() => {
  //   if (texture) {
  //     meshRef.current.material.map = texture;
  //     meshRef.current.material.needsUpdate = true;
  //   }
  // }, [texture]);

  return (
    <mesh ref={meshRef} position={[0, 0, -0.1]}>
      <planeGeometry args={[20, 10]} />
      <meshBasicMaterial />
    </mesh>
  );
};

const Character = ({ position, is2D }) => {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.position.set(position[0], position[1], position[2]);
      if (is2D) {
        ref.current.rotation.y = Math.PI / 2;  // 2D 모드에서 캐릭터를 90도 회전
      } else {
        ref.current.rotation.y = 0;  // 3D 모드로 돌아오면 회전 초기화
      }
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  );
};

const BlueBox = ({ position, onCollect }) => {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      const distance = ref.current.position.distanceTo(new THREE.Vector3(...position));
      if (distance < 1) {
        onCollect();
        ref.current.visible = false;
      }
    }
  });

  return (
    <mesh ref={ref} position={[5, 0, 5]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

const CameraController = ({ position, is2D }) => {
  const { camera } = useThree();
  useFrame(() => {
    if (is2D) {
      camera.position.set(position[0], position[1] + 10, position[2]);
      camera.lookAt(position[0], position[1], position[2]);
      camera.rotation.set(-Math.PI / 2, 0, Math.PI);  // 2D 모드에서 위에서 아래로 보는 시점
    } else {
      camera.position.set(position[0], position[1] + 15, position[2] + 10);
      camera.lookAt(position[0], position[1], position[2]);
    }
  });
  return null;
};

const Trace = ({ position, lifetime }) => {
  const ref = useRef();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity((prev) => prev - 0.1);
    }, lifetime / 10);

    return () => clearInterval(interval);
  }, [lifetime]);

  useEffect(() => {
    if (opacity <= 0) {
      ref.current.visible = false;
    }
  }, [opacity]);

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="grey" transparent opacity={opacity} />
    </mesh>
  );
};

const Scene = () => {
  const [position, setPosition] = useState([0, 0, 0]);
  const [velocity, setVelocity] = useState([0, 0, 0]);
  const [is2D, setIs2D] = useState(false);
  const [traces, setTraces] = useState([]);
  const keys = useRef({});
  const traceLifetime = 1000;  // Trace lifetime in milliseconds

  useEffect(() => {
    const handleKeyDown = (event) => {
      keys.current[event.key] = true;
    };

    const handleKeyUp = (event) => {
      keys.current[event.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    setPosition((prev) => {
      const newPosition = [...prev];
      const newVelocity = [...velocity];

      if (is2D) {
        if (keys.current['a']) newPosition[0] -= 0.1;
        if (keys.current['d']) newPosition[0] += 0.1;

        // Apply gravity and jump in 2D mode
        if (keys.current[' '] && newPosition[1] === 0) {
          newVelocity[1] = 0.3;
        }
        newPosition[1] += newVelocity[1];
        if (newPosition[1] > 0) {
          newVelocity[1] -= 0.01;
        } else {
          newPosition[1] = 0;
          newVelocity[1] = 0;

          // Add trace when character is on the ground
          setTraces((prevTraces) => [
            ...prevTraces,
            { position: [newPosition[0], 0, newPosition[2]], id: Date.now() }
          ]);
        }
      } else {
        if (keys.current['w']) newPosition[2] -= 0.1;
        if (keys.current['s']) newPosition[2] += 0.1;
        if (keys.current['a']) newPosition[0] -= 0.1;
        if (keys.current['d']) newPosition[0] += 0.1;

        // Apply gravity and jump in 3D mode
        if (keys.current[' '] && newPosition[1] === 0) {
          newVelocity[1] = 0.3;
        }
        newPosition[1] += newVelocity[1];
        if (newPosition[1] > 0) {
          newVelocity[1] -= 0.01;
        } else {
          newPosition[1] = 0;
          newVelocity[1] = 0;

          // Add trace when character is on the ground
          setTraces((prevTraces) => [
            ...prevTraces,
            { position: [newPosition[0], -1, newPosition[2]], id: Date.now() }
          ]);
        }
      }

      setVelocity(newVelocity);
      return newPosition;
    });

    setTraces((prevTraces) =>
      prevTraces.filter((trace) => Date.now() - trace.id < traceLifetime)
    );
  });

  const handleCollect = () => {
    setIs2D(true);
  };

  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {is2D ? <PlatformBackground /> : <GridBackground />}
      <Character position={position} is2D={is2D} />
      {!is2D && <BlueBox position={position} onCollect={handleCollect} />}
      {traces.map((trace) => (
        <Trace key={trace.id} position={trace.position} lifetime={traceLifetime} />
      ))}
      <CameraController position={position} is2D={is2D} />
      <OrbitControls />
    </>
  );
};

const CanvasScene = () => {
  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <Scene />
    </Canvas>
  );
};

export default CanvasScene;
