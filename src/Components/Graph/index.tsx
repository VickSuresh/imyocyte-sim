
import { DragEvent, MouseEvent, useState } from 'react';
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
  const [connectingNode, setConnectingNode] = useState<number | null>(null)
  const [firingNodes, setFiringNodes] = useState<number[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [idCounter, setIdCounter] = useState(0)

  const handleAddNode = (e: MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const position = { id: idCounter, X: e.pageX - rect.left - 10, Y: e.pageY - rect.top - 10 }
    setIdCounter(idCounter + 1)
    setPositions(positions.concat(position))
  }

  const handleSignal = (e: MouseEvent) => {
    const id = Number(e.currentTarget.getAttribute('data-key'))
    propagateSignal(id)
    e.stopPropagation()
  }

  const propagateSignal = async (id: number) => {
    const queue = [[id]];

    while (queue.length) {
      const currentLevel = queue.shift() || [];
      const nextLevel: number[] = [];

      currentLevel.forEach(node => {
        const neighbours = connections
          .filter(c => c.from === node)
          .map(c => c.to);

        nextLevel.push(...neighbours);
      });

      setFiringNodes(prevFiringNodes => [...prevFiringNodes, ...currentLevel]);

      await new Promise(resolve => setTimeout(resolve, 200));

      setFiringNodes(prevFiringNodes => prevFiringNodes.filter(n => !currentLevel.includes(n)));

      if (nextLevel.length) {
        queue.push(nextLevel);
      }

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
    setConnections(connections.concat({ from: connectingNode, to: targetNodeKey }))
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
      {/* <svg viewBox='0 0 1000 602' xmlns="http://www.w3.org/2000/svg">
        <line
          x1={positions[0].X + 10}
          x2={positions[1].X + 10}
          y1={positions[0].Y + 10}
          y2={positions[1].Y + 10}
          stroke="black"
        />
      </svg> */}
    </div>
  );
};

export default Graph;