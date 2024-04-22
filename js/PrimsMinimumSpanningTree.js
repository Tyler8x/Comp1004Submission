function Similar(xs, ys){
    xs = new Set(xs);
    ys = new Set(ys);
    return xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));
}

function getRandomInt(min,max){
    return Math.floor(Math.random() * (max-min)) + min}


function Prim(arrayOfPoints,arrayOfLines){
    if (arrayOfLines.length == 0){
        arrayOfLines.push([[arrayOfPoints[0]],[arrayOfPoints[1]]])}
    let treePoints = []
    let treeLines = []
    startPoint = arrayOfPoints[getRandomInt(0,arrayOfPoints.length-1)]
    treePoints.push(startPoint)
    while (!Similar(arrayOfPoints,treePoints)){
        shortLine = [1000000,1000000]
        shortLineLen = 2000000000000
        for (var point of treePoints){
            connectingLines = []
            for (var line of arrayOfLines){
                if (line[0] == point || line[1] == point){
                    lineInTree = false
                    for (var treePoint of treePoints){
                        if (point != treePoint){
                            if (line[0] == treePoint || line[1] == treePoint){
                                lineInTree = true}}}
                    if (lineInTree == false){
                        connectingLines.push(line)}}}
            if (connectingLines != []){
                for (var line of connectingLines){
                    lineLen = (Math.pow(line[0][0]-line[1][0],2))+(Math.pow(line[0][1]-line[1][1],2))
                    if (lineLen < shortLineLen){
                        shortLineLen = lineLen
                        shortLine = line}}}
            if (shortLine[0] == point){
                closestPoint = shortLine[1]}
            else{
                closestPoint = shortLine[0]}}
        treePoints.push(closestPoint)
        treeLines.push(shortLine)}
    return Array.from( new Set(treeLines))}