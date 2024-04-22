class Triangle {
    constructor(point1, point2, point3) {
        this.p1 = point1;
        this.p2 = point2;
        this.p3 = point3;
        this.edges = [];
        this.edges.push(new Edge(this.p1, this.p2));
        this.edges.push(new Edge(this.p2, this.p3));
        this.edges.push(new Edge(this.p3, this.p1));
        //try {
        this.circumcentre = this.circumcentreCalc(this.p1, this.p2, this.p3);
    } //Must be in a try/except, if all points lay on a line the circumcentre
    //catch {                                                                     //is impossible to calculate, rightly so
    //  this.circumcentre = this.p1}}
    circumcentreCalc(a, b, c) {
        let ad = a[0] * a[0] + a[1] * a[1];
        let bd = b[0] * b[0] + b[1] * b[1];
        let cd = c[0] * c[0] + c[1] * c[1];
        let D =
            2 *
            (a[0] * (b[1] - c[1]) +
                b[0] * (c[1] - a[1]) +
                c[0] * (a[1] - b[1]));
        return [
            (1 / D) *
                (ad * (b[1] - c[1]) + bd * (c[1] - a[1]) + cd * (a[1] - b[1])), //#Calculates the circumcentre of the triangle
            (1 / D) *
                (ad * (c[0] - b[0]) + bd * (a[0] - c[0]) + cd * (b[0] - a[0])),
        ];
    }
}

class Edge {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }
    isEqualTo(other) {
        if (this.p1 == other.p1) {
            if (this.p2 == other.p2) {
                return true;
            }
        }
        if (this.p1 == other.p2) {
            if (this.p2 == other.p1) {
                return true;
            }
        }
        return false;
    }
}

function Triangulate(pointList) {
    let triangulation = [];
    let SupTriPoint1 = [-100000, -100000];
    let SupTriPoint2 = [0, 200000];
    let SupTriPoint3 = [200000, 0];
    let SuperTriangle = new Triangle(SupTriPoint1, SupTriPoint2, SupTriPoint3);
    triangulation.push(SuperTriangle);
    for (let point of pointList) {
        let badTriangles = [];
        for (let triangle of triangulation) {
            if (
                Math.pow(triangle.p1[0] - triangle.circumcentre[0], 2) +
                    Math.pow(triangle.p1[1] - triangle.circumcentre[1], 2) >
                Math.pow(point[0] - triangle.circumcentre[0], 2) +
                    Math.pow(point[1] - triangle.circumcentre[1], 2)
            ) {
                badTriangles.push(triangle);
            }
        }
        let polygon = [];
        let allEdges = [];
        for (let triangle of badTriangles) {
            for (let triangleEdge of triangle.edges) {
                allEdges.push(triangleEdge);
            }
        }
        for (let edge of allEdges) {
            let comps = 0;
            for (let edgeComp of allEdges) {
                if (edge.isEqualTo(edgeComp)) {
                    comps = comps + 1;
                }
            }
            if (comps == 1) {
                polygon.push(edge);
            }
        }
        triangulation = triangulation.filter((e) => !badTriangles.includes(e));
        for (let edge of polygon) {
            newTri = new Triangle(point, edge.p1, edge.p2);
            triangulation.push(newTri);
        }
    }
    function pointInSuperTriangle(triangle) {
        let a = [SupTriPoint1, SupTriPoint2, SupTriPoint3].includes(
            triangle.p1
        );
        let b = [SupTriPoint1, SupTriPoint2, SupTriPoint3].includes(
            triangle.p2
        );
        let c = [SupTriPoint1, SupTriPoint2, SupTriPoint3].includes(
            triangle.p3
        );
        return a || b || c;
    }

    triangulation = triangulation.filter((e) => !pointInSuperTriangle(e));
    return triangulation;
}
