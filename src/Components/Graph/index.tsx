
import { DragEvent, MouseEvent, useRef, useState } from 'react';
import GraphNode from '../GraphNode';
import "./styles.css"

interface Position {
  id: number;
  X: number;
  Y: number;
}

interface Connection {
  from: number;
  to: number;
}

interface IProps {
  mode?: Mode;
}

export type Mode = 'delete' | 'connect' | 'signal'


const Graph = ({ mode = 'delete' }: IProps) => {

  const [positions, setPositions] = useState<Position[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [connectingNode, setConnectingNode] = useState<number | null>(null)
  const [firingNodes, setFiringNodes] = useState<number[]>([])
  const idCounter = useRef(0)

  const generateNodes = (n: number) => {
    const nodes: Position[] = [];
    const newConnections: Connection[] = [];

    for (let i = idCounter.current; i < n + idCounter.current; i++) {
      const node: Position = {
        id: i,
        X: Math.floor(Math.random() * (990 - 10)) + 10,
        Y: Math.floor(Math.random() * (592 - 10)) + 10
      };
      nodes.push(node);
    }
    idCounter.current += n;

    nodes.forEach((node) => {
      const distances = nodes.map((node2, j) => ({
        index: node2.id,
        distance: Math.hypot(node.X - node2.X, node.Y - node2.Y)
      }));

      distances.sort((a, b) => a.distance - b.distance)

      const numNeighbours = Math.floor(Math.random() * 5) + 4

      for (let k = 0; k < numNeighbours; k++) {
        newConnections.push({ from: node.id, to: distances[k].index })
        newConnections.push({ from: distances[k].index, to: node.id })
      }
    })

    setPositions(nodes);
    setConnections(newConnections);
  }

  const handleAddNode = (e: MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const position = { id: idCounter.current, X: e.pageX - rect.left - 10, Y: e.pageY - rect.top - 10 }
    setPositions(positions.concat(position))
    idCounter.current++;
  }

  const handleSignal = (e: MouseEvent) => {
    const id = Number(e.currentTarget.getAttribute('data-key'))
    propagateSignal(id)
    e.stopPropagation()
  }

  const propagateSignal = async (id: number) => {
    const queue = [[id]];
    let lastLevel = new Set<number>();

    while (queue.length) {
      const currentLevel = queue.shift() || [];
      const nextLevel: number[] = [];

      currentLevel.forEach(node => {
        const neighbours = connections
          .filter(c => c.from === node && !lastLevel.has(c.to))
          .map(c => c.to);

        nextLevel.push(...neighbours);
      });

      setFiringNodes(prevFiringNodes => [...prevFiringNodes, ...currentLevel]);

      await new Promise(resolve => setTimeout(resolve, 200));

      setFiringNodes(prevFiringNodes => prevFiringNodes.filter(n => !currentLevel.includes(n)));

      if (nextLevel.length) {
        queue.push(nextLevel);
      }

      lastLevel = new Set(currentLevel)
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const handleDeleteNode = (e: MouseEvent) => {
    const targetNodeKey = Number(e.currentTarget.getAttribute("data-key"))
    const newPositions = positions.filter((p) => p.id !== targetNodeKey)
    const newConnections = connections.filter((c) => c.from !== targetNodeKey && c.to !== targetNodeKey)
    setPositions(newPositions)
    setConnections(newConnections)
    e.stopPropagation()
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleConnectNodes = (e: MouseEvent) => {
    e.stopPropagation()
    const targetNodeKey = Number(e.currentTarget.getAttribute("data-key"))
    if (connectingNode === null) {
      setConnectingNode(targetNodeKey)
      return
    }
    const connection = { from: connectingNode, to: targetNodeKey }
    if (connections.some((c) => c.from === connection.from && c.to === connection.to) ||
      connection.from === connection.to) {
      setConnectingNode(null)
      return
    }
    setConnections(connections.concat({ from: connectingNode, to: targetNodeKey }, { from: targetNodeKey, to: connectingNode }))
    setConnectingNode(null)
  }

  const handleDragEnd = (e: DragEvent) => {
    const rect = e.currentTarget.parentElement?.getBoundingClientRect()
    const targetNodeKey = Number(e.currentTarget.getAttribute("data-key"))
    if (!rect) { return }
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      const newPositions = positions.map((p) => {
        if (p.id === targetNodeKey) {
          return { id: p.id, X: e.pageX - rect.left - 10, Y: e.pageY - rect.top - 10 }
        }
        return p
      })
      setPositions(newPositions)
    }
  }

  return (
    <div>
      <div
        className="Container"
        onDragEnter={(e: DragEvent) => e.preventDefault()}
        onDragOver={handleDragOver}
        onClick={handleAddNode}
      >
        {positions.map((position) =>
          <GraphNode
            key={position.id}
            id={position.id}
            X={position.X}
            Y={position.Y}
            firing={firingNodes.some(n => n === position.id)}
            handleClick={mode === 'delete' ? handleDeleteNode : mode === 'connect' ? handleConnectNodes : handleSignal}
            handleDragEnd={handleDragEnd}
          />
        )}
        <svg viewBox='0 0 1000 602' xmlns="http://www.w3.org/2000/svg">
          {connections.map((connection, i) => {
            const position1 = positions.find((p) => p.id === connection.from)
            const position2 = positions.find((p) => p.id === connection.to)

            if (position1 && position2) {
              return (
                <line
                  key={i}
                  x1={position1.X + 10}
                  x2={position2.X + 10}
                  y1={position1.Y + 10}
                  y2={position2.Y + 10}
                  stroke="black"
                />
              )
            }
          })}
        </svg>
      </div>
      <button onClick={() => generateNodes(30)}>Generate Nodes</button>
    </div>
  );
};

export default Graph;