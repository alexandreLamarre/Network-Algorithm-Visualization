import React from "react";
import Modal from "react-modal";
import Vertex from "../../datatypes/Vertex";
import Edge from "../../datatypes/Edge";
import "./Upload.css";

Modal.setAppElement("#root");

class UploadWindow extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      open: false,
      filename: "",
      file: null,
      error: "",
    };
    this.app = this.props.app;
  }


  setOpen(v){
    this.setState({open:v});
  }


  async setFile(e){
    e.preventDefault();
    if(e.target.files === undefined || e.target.files === null) return;
    await this.setState({filename: e.target.files[0].name, file: e.target.files[0], error: ""});
  }

  checkFile(e){
    e.preventDefault();
    const file = this.state.file;
    console.log(file)
    if(this.state.file === null || this.state.file === undefined) {
      this.setState({error: "No file uploaded."});
      return;
    };
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (() => {
      const dimension = this.app.state.dimension;
      const width = this.app.state.height*0.55;
      const height = this.app.state.height*0.55;
      const depth = this.app.state.height*0.55;
      const [error, vertices, edges] = parseInput(reader.result, dimension, width, height, depth);
      if(error !== "") {
        this.setState({error: error});
        return;
      }
      const relevant_network = dimension === 2?
        this.app.network.current:dimension === 3? this.app.network3d.current:
          this.app.customnetwork.current;
      this.app.setState({running:false, paused:true});
      if(dimension === 2) {
        relevant_network.setState({vertices: vertices, edges:edges});
      }
      else if(dimension === 3){
        upload3D(this.app, relevant_network, vertices, edges);
      }
      else{
        const vertex_list = vertices;
        const vertex_grid = {};
        const edge_map = {};
        const edge_list = [];
        console.log(relevant_network.state.gridConstant);
        for(let i = 0; i < relevant_network.state.gridConstant; i++){
          for(let j = 0; j < relevant_network.state.gridConstant; j++){
            vertex_grid[[i,j]] = [];
          }
        }
        for(let i = 0; i < vertex_list.length; i++){
          const x = vertex_list[i].x;
          const y = vertex_list[i].y;
          console.log(relevant_network.getGrid(x,y));
          vertex_grid[relevant_network.getGrid(x,y)].push(i);
        }
        for(let i = 0; i < edges.length; i++){
          edge_list.push([edges[i].start, edges[i].end]);
          edge_map[[edges[i].start, edges[i].end]] = true;
        }
        relevant_network.setState({vertices: vertex_grid, edges: edge_map,
            edgeStart: [null, null], box:null,
            selected_vertices: null, vertex_list: vertex_list, edge_list: edge_list, operationsBuffer: [],
              operationsBufferIndex:-1})
      }
    });
  }

  render(){
    return <div>
              <Modal isOpen = {this.state.open}
                onRequestClose = {() => this.setOpen(false)}
                className = "upload"
                overlayClassName = "uploadoverlay"
                >
                  <p> Currently Supported Formats: .csv files</p>
                  <p> The exact specifications of the file are detailed <b><a
                   href = "https://github.com/alexandreLamarre/Network-Algorithm-Visualization/blob/master/README.md#Uploading-Data"
                   target = "_blank">here
                  </a></b></p>

                  <div className = "formBlock">
                    <form onSubmit = {(e) => this.checkFile(e)}>
                      <input
                       onChange = {(e) => this.setFile(e)}
                       type = "file"
                       id = "myFile"
                       name = "filename"/>
                      <input type = "submit"/>
                    </form>
                  </div>
                  <p style = {{color: "rgb(255,160,0)"}}
                  className = "errors"> {this.state.error} </p>
              </Modal>
          </div>
  }
}

export default UploadWindow;

function parseInput(text, dimension, width, height, depth){
  // console.log("the full text is ", text);
  const values = text.split("vertex");
  const new_vertices = [];
  for(let i = 1; i < values.length-1; i++){
    const vertex_values = values[i].split(",");
    const x = parseFloat(vertex_values[1]);
    const y = parseFloat(vertex_values[2]);
    var z = vertex_values[3].replace(" ", "") === ""?null:parseFloat(vertex_values[2]);
    if(z === null && dimension === 3) z = (Math.random()*depth);
    const v = new Vertex(x,y,z);
    const degree = parseInt(vertex_values[4]);
    v.degree = degree;
    const size = parseInt(vertex_values[5]);
    v.size = size;
    var color = rgb_to_str(parseInt(vertex_values[6]), parseInt(vertex_values[7]),
                                            parseInt(vertex_values[8].replace("\n", "")));
    v.color = color;
    new_vertices.push(v);
    if(i > 199) return ['Too many vertices to parse', [], []];
  }
  const next_values = values[values.length-1].split("edge");
  const vertex_values = next_values[0].split(",");
  const x = parseFloat(vertex_values[1]);
  const y = parseFloat(vertex_values[2]);
  var z = vertex_values[3].replace(" ", "") === ""?null:parseFloat(vertex_values[2]);
  if(z === null && dimension === 3) z = (Math.random()*depth);
  const v = new Vertex(x,y,z);
  const degree = parseInt(vertex_values[4]);
  v.degree = degree;
  const size = parseInt(vertex_values[5]);
  v.size = size;
  var color = rgb_to_str(parseInt(vertex_values[6]), parseInt(vertex_values[7]),
                                            parseInt(vertex_values[8].replace("\n", "")));
  v.color = color;

  const error = resizeVertices(new_vertices, width, height, dimension);
  if(error !== "") return [error, [], []];

  const new_edges = [];
  new_vertices.push(v);
  for(let i = 1; i < next_values.length; i++){
    const edge_values = next_values[i].split(",")
    const start = parseInt(edge_values[1]);
    const end = parseInt(edge_values[2]);
    const weight = parseFloat(edge_values[3]);
    const alpha = parseFloat(edge_values[4]);
    var color = rgb_to_str(parseInt(edge_values[5]), parseInt(edge_values[6]),
                                            parseInt(edge_values[7].replace("\n", "")));
    if(color === "rgb(0,0,0)" && dimension === 3) color = "rgb(211,211,211)";
    const e = new Edge(start, end);
    e.weight = weight;
    e.alpha = alpha;
    e.color = color;
    new_edges.push(e);
    if(i > 600) return ["Too many edges to parse", [], []]
  }
  return ["",new_vertices, new_edges];
}

function rgb_to_str(red,green,blue){
  return "rgb(" + red.toString() + "," + green.toString() + "," + blue.toString() +")";
}

function resizeVertices(vertices,width, height, dimension){
  var minX = Infinity;
  var minY = Infinity;
  var minZ = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  var maxZ = -Infinity;
  for(let i = 0; i < vertices.length; i++){
    minX = Math.min(vertices[i].x, minX);
    minY = Math.min(vertices[i].y, minY);
    minZ = Math.min(vertices[i].z, minZ);
    maxX = Math.max(vertices[i].x, maxX);
    maxY = Math.max(vertices[i].y, maxY);
    maxZ = Math.max(vertices[i].z, maxZ);
  }
  if(minX === maxX || minY === maxY || (maxZ === minZ && dimension === 3)){
    return "error: completely: super-imposed vertices";
  }

  for(let i = 0; i< vertices.length; i++){
    vertices[i].x = (vertices[i].x - minX)*(width-5)/(-minX+maxX);
    vertices[i].y = (vertices[i].y - minY)*(height-5)/(-minY+maxY);
    if(dimension === 3) vertices[i].z = (vertices[i].z - minZ)*(height-5)/(-minZ+maxZ);
  }
  return "";
}

async function upload3D(app, network, vertices, edges){
  await app.setState({numE: edges.length, numV: vertices.length});
  await network.resetNetwork();
  network.setState({vertices: vertices, edges:edges});
}