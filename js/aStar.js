class PriorityQueue {
    constructor(start) {
        this.queue = [[0, start]];
    }

    push(priority, item) {
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i][0] > priority) {
                this.queue.push([]);
                for (let j = this.queue.length - 1; j > i; j--) {
                    this.queue[j] = this.queue[j - 1];
                }
                this.queue[i] = [priority, item];
                return;
            }
        }
        this.queue.push([priority, item]);
    }
    pop() {
        return this.queue.shift();
    }
}

function aStar(graph, start, goal) {
    let queue = new PriorityQueue(start);
    let costs = {};
    costs[start] = 0;
    let predecessors = {};
    predecessors[start] = null;
    let processed = new Set();
    while (queue.queue.length) {
        let poppedItem = queue.pop();
        let cost = poppedItem[0];
        let current = poppedItem[1];
        if (current[0] == goal[0] && current[1] == goal[1]) {
            let path = [];
            while (current != null) {
                path.push(current);
                current = predecessors[current];
            }
            return path.reverse();
        }
        if (!processed.has(current)) {
            processed.add(current);
            let neighbourSquares = [
                [0, 1],
                [0, -1],
                [1, 0],
                [-1, 0],
            ];
            for (let square of neighbourSquares) {
                let i = square[0];
                let j = square[1];
                let neighbour = [current[0] + i, current[1] + j];

                if (
                    0 <= neighbour[0] &&
                    neighbour[0] < graph.length &&
                    0 <= neighbour[1] &&
                    neighbour[1] < graph.length &&
                    graph[neighbour[0]][neighbour[1]] != "X"
                ) {
                    let newCost =
                        costs[current] + graph[neighbour[0]][neighbour[1]].cost;
                    if (!(neighbour in costs) || newCost < costs[neighbour]) {
                        costs[neighbour] = newCost;
                        let priority = newCost + Manhattan(neighbour, goal);
                        predecessors[neighbour] = current;
                        queue.push(priority, neighbour);
                    }
                }
            }
        }
    }
    return "Error";
}

function Manhattan(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}
