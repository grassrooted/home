import React, { useMemo, useRef, useEffect } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";

const FOCUS_NODE = "Paula Blackmon"; // The node we want to focus on

const processContributions = (allContributions, cityProfileData) => {
  const sharedDonorsMap = new Map();
  const donorToRecipients = new Map();
  const delimiter = "|||";

  allContributions.forEach(({ Name, Recipient }) => {
    if (!donorToRecipients.has(Name)) {
      donorToRecipients.set(Name, new Set());
    }
    donorToRecipients.get(Name).add(Recipient);
  });

  donorToRecipients.forEach((recipients) => {
    const recipientList = Array.from(recipients);
    for (let i = 0; i < recipientList.length; i++) {
      for (let j = i + 1; j < recipientList.length; j++) {
        const key = [recipientList[i], recipientList[j]].sort().join(delimiter);
        sharedDonorsMap.set(key, (sharedDonorsMap.get(key) || 0) + 1);
      }
    }
  });

  const nodes = {};
  const links = [];

  Array.from(sharedDonorsMap.entries()).forEach(([key, sharedDonors]) => {
    const [recipient1, recipient2] = key.split(delimiter);
    const profile1 = cityProfileData.find((profile) => profile.name === recipient1);
    const profile2 = cityProfileData.find((profile) => profile.name === recipient2);

    if (!nodes[recipient1]) {
      nodes[recipient1] = {
        id: recipient1,
        label: recipient1,
        img: profile1?.path_to_headshot_photo || "",
      };
    }
    if (!nodes[recipient2]) {
      nodes[recipient2] = {
        id: recipient2,
        label: recipient2,
        img: profile2?.path_to_headshot_photo || "",
      };
    }

    links.push({ source: recipient1, target: recipient2, weight: sharedDonors });
  });

  // Filter links to only include connections involving "Teri Castillo"
  const filteredLinks = links.filter(
    (link) => link.source === FOCUS_NODE || link.target === FOCUS_NODE
  );

  // Collect all nodes that are either "Teri Castillo" or directly connected to it
  const connectedNodes = new Set();
  connectedNodes.add(FOCUS_NODE);
  filteredLinks.forEach((link) => {
    connectedNodes.add(link.source);
    connectedNodes.add(link.target);
  });

  // Filter nodes to only include "Teri Castillo" and connected nodes
  const filteredNodes = Object.values(nodes).filter((node) => connectedNodes.has(node.id));

  return { nodes: filteredNodes, links: filteredLinks };
};

const ClusteredForceGraph = ({ allContributions, cityProfileData }) => {
  const fgRef = useRef();
  const graphData = useMemo(
    () => processContributions(allContributions, cityProfileData),
    [allContributions, cityProfileData]
  );
  const scaleFactor = 100;

  useEffect(() => {
    if (fgRef.current) {
      const chargeForce = fgRef.current.d3Force("charge");
      if (chargeForce) chargeForce.strength(-10);

      const linkForce = fgRef.current.d3Force("link");
      if (linkForce) linkForce.strength((link) => Math.min(1, link.weight / 100));
    }
  }, []);

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={graphData}
      nodeAutoColorBy="id"
      nodeLabel="label"
      linkWidth={(link) => 1 / link.weight}
      linkDistance={(link) => (link.weight > 0 ? (1 / link.weight) * scaleFactor : scaleFactor)}
      linkOpacity={0.7}
      backgroundColor="#101020"
      width={window.innerWidth}
      height={600}
      d3AlphaDecay={0.05}
      d3VelocityDecay={0.3}
      nodeThreeObject={(node) => {
        const textureLoader = new THREE.TextureLoader();
        const imgTexture = textureLoader.load(
          `${process.env.PUBLIC_URL}${node.img}` || "/candidates/MannyPelaez/pelaez_headshot.jpeg"
        );
        const imgMaterial = new THREE.SpriteMaterial({ map: imgTexture });
        const sprite = new THREE.Sprite(imgMaterial);
        sprite.scale.set(10, 10, 1);
        return sprite;
      }}
    />
  );
};

export default ClusteredForceGraph;
