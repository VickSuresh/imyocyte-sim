import { DragEvent, DragEventHandler, MouseEventHandler, useEffect, useState } from "react";
import "./styles.css";

interface IProps {
  X: number
  Y: number
  handleClick?: MouseEventHandler
  id: number
  handleDragEnd?: DragEventHandler
  firing?: boolean
}

const GraphNode = ({ X = 0, Y = 0, handleClick, id, handleDragEnd, firing = false }: IProps) => {

  return (
    <div
      data-key={id}
      className="circle"
      style={{ left: X, top: Y, backgroundColor: firing ? 'red' : 'black' }}
      draggable
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    />
  )
}

export default GraphNode