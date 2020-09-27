class Vertex {
  constructor(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
    if(this.z === undefined) this.z = null;
    this.degree = 0;
    this.size = 3;
    this.color = "rgb(0,255,255)";
  }

  add(other){
    this.x += other.x;
    this.y += other.y;
    if(this.z !== null) this.z += other.z;
  }

  /*In case we need to set specific coordinates, but we shouldn't have to */

  setX(x){
    this.x = x;
  }

  setY(y){
    this.y = y;
  }

  setZ(z){
    this.z = z;
  }

  increment_degree(){
    this.degree += 1;
  }

  setSize(size){
    this.size = size;
  }

  setColor(color){
    this.color = color;
  }

  setVector(vector){
    this.setX(vector[0]);
    this.setY(vector[1]);
    if(vector[2] !== undefined && this.z !== null){
      this.setZ(vector[2]);
    }
  }
}

export default Vertex;
