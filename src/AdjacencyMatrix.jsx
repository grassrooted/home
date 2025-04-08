import React, { useEffect, useState } from "react";

const AdjacencyMatrix = ({ allContributions }) => {
  const [matrix, setMatrix] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);

  useEffect(() => {
    const candidates = Array.from(new Set(allContributions.map(({ Recipient }) => Recipient)));
    setAllCandidates(candidates);

    const candidateIndex = Object.fromEntries(
      candidates.map((candidate, index) => [candidate, index])
    );
    const size = candidates.length;
    const adjMatrix = Array.from({ length: size }, () => Array(size).fill(0));

    const donorMap = new Map();
    allContributions
      .forEach(({ Name, Recipient }) => {
        if (!donorMap.has(Name)) {
          donorMap.set(Name, new Set());
        }
        donorMap.get(Name).add(Recipient);
      });

    donorMap.forEach((recipients) => {
      const recipientArray = Array.from(recipients);
      for (let i = 0; i < recipientArray.length; i++) {
        for (let j = i + 1; j < recipientArray.length; j++) {
          const x = candidateIndex[recipientArray[i]];
          const y = candidateIndex[recipientArray[j]];
          if (x !== undefined && y !== undefined) {
            adjMatrix[x][y] += 1;
            adjMatrix[y][x] += 1;
          }
        }
      }
    });

    setMatrix(adjMatrix);
  }, [allContributions]);

  const getColor = (value) => {
    if (value > 50) return "#ff0000"; // Strong relationship (red)
    if (value > 25) return "#ff8800"; // Medium relationship (orange)
    if (value > 10) return "#ffff00"; // Weak relationship (yellow)
    return "#000"; // No or minimal relationship (white)
  };

  return (
    <div>
      <h2>Adjacency Matrix</h2>
      <table border="1">
        <thead>
          <tr>
            <th></th>
            {allCandidates.map((candidate) => (
              <th key={candidate}>{candidate}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>{allCandidates[rowIndex]}</td>
              {row.map((cell, colIndex) => (
                <td key={colIndex} style={{ backgroundColor: getColor(cell), textAlign: "center" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdjacencyMatrix;
