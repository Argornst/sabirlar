import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Bounds,
  Html,
  OrbitControls,
  PerspectiveCamera,
  Edges,
} from '@react-three/drei';
import * as THREE from 'three';
import { buildLoadUnitsForPlacement } from '../../../domain/services/container-load-plan.service';

function cmToScene(value) {
  return value / 100;
}

function ContainerShell({ container }) {
  const width = cmToScene(container.innerWidthCm);
  const height = cmToScene(container.innerHeightCm);
  const length = cmToScene(container.innerLengthCm);

  const cx = width / 2;
  const cy = height / 2;
  const cz = length / 2;

  return (
    <group>
      <mesh position={[cx, cy, cz]}>
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial
          color="#cbd5e1"
          transparent
          opacity={0.07}
          roughness={0.95}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
        <Edges color="#64748b" />
      </mesh>

      <mesh position={[cx, 0.01, cz]}>
        <boxGeometry args={[width, 0.02, length]} />
        <meshStandardMaterial color="#111827" transparent opacity={0.92} />
      </mesh>
    </group>
  );
}

function FloorGrid({ container }) {
  const width = cmToScene(container.innerWidthCm);
  const length = cmToScene(container.innerLengthCm);

  return (
    <gridHelper
      args={[Math.max(width, length), 40, '#334155', '#1e293b']}
      position={[width / 2, 0.015, length / 2]}
    />
  );
}

function TooltipCard({ item, packed }) {
  return (
    <div className="lp-load-plan-tooltip">
      <div className="lp-load-plan-tooltip__title">
        {item.lotNumber || item.productCode || 'Lot'}
      </div>

      <div className="lp-load-plan-tooltip__row">
        <span>Ürün</span>
        <strong>{item.productCode || item.productName || '-'}</strong>
      </div>

      <div className="lp-load-plan-tooltip__row">
        <span>Yük</span>
        <strong>{item.loadMaterialCode || item.loadMaterialName || '-'}</strong>
      </div>

      <div className="lp-load-plan-tooltip__row">
        <span>Palet</span>
        <strong>{item.palletMaterialCode || item.palletMaterialName || '-'}</strong>
      </div>

      <div className="lp-load-plan-tooltip__row">
        <span>İstif</span>
        <strong>{item.stackGroup || '-'}</strong>
      </div>

      <div className="lp-load-plan-tooltip__row">
        <span>Sıra</span>
        <strong>{item.stackOrder}</strong>
      </div>

      <div className="lp-load-plan-tooltip__row">
        <span>Ağırlık</span>
        <strong>{item.weightKg.toFixed(3)} kg</strong>
      </div>

      <div className="lp-load-plan-tooltip__row">
        <span>Ölçü</span>
        <strong>
          {item.widthCm} × {item.lengthCm} × {item.heightCm} cm
        </strong>
      </div>

      {packed ? (
        <>
          <div className="lp-load-plan-tooltip__row">
            <span>Yerleşim</span>
            <strong>
              {packed.rows}×{packed.cols}
            </strong>
          </div>

          <div className="lp-load-plan-tooltip__row">
            <span>Gap</span>
            <strong>{packed.chosenGapCm} cm</strong>
          </div>
        </>
      ) : null}
    </div>
  );
}

/**
 * Premium EPAL pallet model
 * Logic:
 * - top deck boards
 * - 9 blocks
 * - 3 bottom long boards
 * No piece passes through blocks.
 * All contacts are flush: top boards -> blocks -> bottom boards
 */
function PremiumEPALPallet({ item }) {
  // Tiny visual inset so adjacent pallets don't look fused.
  const visualInsetCm = 4;
  const palletWidthCm = Math.max(10, item.widthCm - visualInsetCm);
  const palletLengthCm = Math.max(10, item.lengthCm - visualInsetCm);
  const palletHeightCm = Math.max(14, item.palletBaseHeightCm);

  const width = cmToScene(palletWidthCm);   // short side: 80 cm
  const length = cmToScene(palletLengthCm); // long side: 120 cm
  const height = cmToScene(palletHeightCm); // ~14 cm

  // EPAL-ish vertical split:
  // top board + block + bottom board = full pallet height
  const topDeckHeight = height * 0.22;
  const bottomDeckHeight = height * 0.22;
  const blockHeight = height - topDeckHeight - bottomDeckHeight;

  const topY = height / 2 - topDeckHeight / 2;
  const blockY = -height / 2 + bottomDeckHeight + blockHeight / 2;
  const bottomY = -height / 2 + bottomDeckHeight / 2;

  const woodLight = '#deb07b';
  const woodMid = '#c78d58';
  const woodDark = '#ac723f';

  // ---- Top boards ----
  // 5 long boards along 120 cm direction.
  const topBoardCount = 5;
  const topBoardGap = width * 0.035;
  const totalTopGap = topBoardGap * (topBoardCount - 1);
  const topBoardWidth = (width - totalTopGap) / topBoardCount;

  const topBoardXs = Array.from({ length: topBoardCount }).map((_, index) => (
    -width / 2 + topBoardWidth / 2 + index * (topBoardWidth + topBoardGap)
  ));

  // ---- 9 blocks ----
  // 3 columns on width, 3 rows on length.
  const blockWidth = width * 0.18;
  const blockLength = length * 0.12;

  const blockEdgeInsetX = blockWidth / 2;
  const blockEdgeInsetZ = blockLength / 2;

  const blockXs = [
    -width / 2 + blockEdgeInsetX,
    0,
    width / 2 - blockEdgeInsetX,
  ];

  const blockZs = [
    -length / 2 + blockEdgeInsetZ,
    0,
    length / 2 - blockEdgeInsetZ,
  ];

  // ---- Bottom boards ----
  // Exactly 3 long boards along 120 cm direction.
  // Centered under block rows, flush touching blocks.
  const bottomBoardWidth = width * 0.19;
  const bottomBoardLength = length;

  const bottomBoardXs = [
    -width / 2 + bottomBoardWidth / 2,
    0,
    width / 2 - bottomBoardWidth / 2,
  ];

  return (
    <group position={[0, height / 2, 0]}>
      {/* Top deck boards */}
      {topBoardXs.map((x, index) => (
        <mesh key={`top-board-${index}`} position={[x, topY, 0]}>
          <boxGeometry args={[topBoardWidth, topDeckHeight, length]} />
          <meshStandardMaterial color={woodLight} roughness={0.92} metalness={0.01} />
        </mesh>
      ))}

      {/* 9 blocks */}
      {blockXs.flatMap((x, xi) =>
        blockZs.map((z, zi) => (
          <mesh key={`block-${xi}-${zi}`} position={[x, blockY, z]}>
            <boxGeometry args={[blockWidth, blockHeight, blockLength]} />
            <meshStandardMaterial color={woodMid} roughness={0.95} metalness={0.01} />
          </mesh>
        )),
      )}

      {/* Bottom 3 long boards (120 cm) */}
      {bottomBoardXs.map((x, index) => (
        <mesh key={`bottom-board-${index}`} position={[x, bottomY, 0]}>
          <boxGeometry args={[bottomBoardWidth, bottomDeckHeight, bottomBoardLength]} />
          <meshStandardMaterial color={woodDark} roughness={0.96} metalness={0.01} />
        </mesh>
      ))}
    </group>
  );
}

function DrumUnit({
  diameterCm,
  heightCm,
  xCm,
  zCm,
  palletBaseHeightCm,
  color,
  isHovered,
}) {
  const radius = cmToScene(diameterCm / 2);
  const height = cmToScene(heightCm);
  const x = cmToScene(xCm);
  const z = cmToScene(zCm);
  const y = cmToScene(palletBaseHeightCm) + height / 2;
  const emissiveColor = isHovered ? new THREE.Color(color) : new THREE.Color('#000000');

  return (
    <group position={[x, y, z]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 36]} />
        <meshStandardMaterial
          color={color}
          roughness={0.28}
          metalness={0.18}
          emissive={emissiveColor}
          emissiveIntensity={isHovered ? 0.16 : 0}
        />
      </mesh>

      <mesh position={[0, height / 2 - 0.01, 0]}>
        <cylinderGeometry args={[radius * 1.01, radius * 1.01, 0.02, 36]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.35} metalness={0.32} />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[radius * 0.78, radius * 0.05, 10, 28]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  );
}

function BoxUnit({
  widthCm,
  lengthCm,
  heightCm,
  xCm,
  zCm,
  palletBaseHeightCm,
  color,
  isHovered,
}) {
  const x = cmToScene(xCm);
  const z = cmToScene(zCm);
  const y = cmToScene(palletBaseHeightCm) + cmToScene(heightCm) / 2;
  const emissiveColor = isHovered ? new THREE.Color(color) : new THREE.Color('#000000');

  return (
    <mesh position={[x, y, z]}>
      <boxGeometry args={[cmToScene(widthCm), cmToScene(heightCm), cmToScene(lengthCm)]} />
      <meshStandardMaterial
        color={color}
        roughness={0.5}
        metalness={0.06}
        emissive={emissiveColor}
        emissiveIntensity={isHovered ? 0.14 : 0}
      />
    </mesh>
  );
}

function LoadUnits({ item, isHovered, unitsPerPallet }) {
  const packed = buildLoadUnitsForPlacement(item, unitsPerPallet);
  const unitPlacements = packed?.placements ?? [];

  return (
    <group>
      {unitPlacements.map((unit, index) => {
        const localXcm = unit.xOffsetCm - item.widthCm / 2;
        const localZcm = unit.zOffsetCm - item.lengthCm / 2;

        return (
          <group key={`${item.id}-unit-${index + 1}`}>
            {item.shape === 'cylinder' ? (
              <DrumUnit
                diameterCm={unit.diameterCm || Math.min(item.loadWidthCm, item.loadLengthCm)}
                heightCm={item.loadHeightCm}
                xCm={localXcm}
                zCm={localZcm}
                palletBaseHeightCm={item.palletBaseHeightCm}
                color={item.color}
                isHovered={isHovered}
              />
            ) : (
              <BoxUnit
                widthCm={unit.widthCm || item.loadWidthCm}
                lengthCm={unit.lengthCm || item.loadLengthCm}
                heightCm={item.loadHeightCm}
                xCm={localXcm}
                zCm={localZcm}
                palletBaseHeightCm={item.palletBaseHeightCm}
                color={item.color}
                isHovered={isHovered}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}

function PlacementMesh({
  item,
  selectedLotIds,
  onHover,
  isHovered,
  unitsPerPallet,
}) {
  const isVisible =
    selectedLotIds.length === 0 || selectedLotIds.includes(item.lotId);

  if (!isVisible) {
    return null;
  }

  const width = cmToScene(item.widthCm);
  const length = cmToScene(item.lengthCm);

  const centerX = cmToScene(item.xCm) + width / 2;
  const centerZ = cmToScene(item.zCm) + length / 2;

  const packed = buildLoadUnitsForPlacement(item, unitsPerPallet);

  return (
    <group
      position={[centerX, cmToScene(item.yCm), centerZ]}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover(item);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        onHover(null);
      }}
    >
      <PremiumEPALPallet item={item} />
      <LoadUnits item={item} isHovered={isHovered} unitsPerPallet={unitsPerPallet} />

      {isHovered ? (
        <Html distanceFactor={8} position={[0, cmToScene(item.heightCm + 16), 0]}>
          <TooltipCard item={item} packed={packed} />
        </Html>
      ) : null}
    </group>
  );
}

function SceneContent({
  data,
  selectedLotIds,
  unitsPerPalletByLineId,
}) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <>
      <ambientLight intensity={1.08} />
      <directionalLight intensity={0.92} position={[6, 8, 4]} />
      <directionalLight intensity={0.34} position={[-4, 5, -4]} />
      <hemisphereLight intensity={0.42} groundColor="#0f172a" color="#cbd5e1" />

      <FloorGrid container={data.container} />
      <ContainerShell container={data.container} />

      {data.placements.map((item) => (
        <PlacementMesh
          key={item.id}
          item={item}
          selectedLotIds={selectedLotIds}
          onHover={(value) => setHoveredId(value?.id ?? null)}
          isHovered={hoveredId === item.id}
          unitsPerPallet={unitsPerPalletByLineId.get(item.palletLineId)}
        />
      ))}
    </>
  );
}

export function ContainerLoadPlanScene({
  data,
  selectedLotIds = [],
  cameraPreset = 'iso',
  controlsRef,
  sceneCanvasRef,
  unitsPerPalletByLineId,
}) {
  const cameraPosition = useMemo(() => {
    if (!data) {
      return [7, 5, 7];
    }

    const width = cmToScene(data.container.innerWidthCm);
    const length = cmToScene(data.container.innerLengthCm);
    const height = cmToScene(data.container.innerHeightCm);

    if (cameraPreset === 'front') {
      return [width / 2, height * 1.15, -length * 0.95];
    }

    if (cameraPreset === 'side') {
      return [-width * 1.25, height * 1.15, length / 2];
    }

    return [width * 1.25, height * 1.4, length * 1.08];
  }, [cameraPreset, data]);

  if (!data) {
    return null;
  }

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        preserveDrawingBuffer: true,
        antialias: true,
      }}
      onCreated={({ gl }) => {
        sceneCanvasRef.current = gl.domElement;
      }}
    >
      <PerspectiveCamera makeDefault position={cameraPosition} fov={42} />
      <Bounds fit clip observe margin={1.1}>
        <SceneContent
          data={data}
          selectedLotIds={selectedLotIds}
          unitsPerPalletByLineId={unitsPerPalletByLineId}
        />
      </Bounds>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        enableRotate
        enableZoom
        minDistance={2}
        maxDistance={30}
      />
    </Canvas>
  );
}