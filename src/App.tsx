import { ChangeEvent, useState } from "react";
import "./App.css"
import Graph, { Mode } from './Components/Graph';

function App() {

  const [select, setSelect] = useState("delete")

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelect(e.target.value)
  }

  return (
    <div style={{ padding: "1rem" }}>
      <Graph mode={select as Mode} />
      <select value={select} onChange={handleSelectChange}>
        <option value="delete">Delete</option>
        <option value="connect">Connect</option>
        <option value="signal">Signal</option>
      </select>
    </div>
  );
}

export default App;
