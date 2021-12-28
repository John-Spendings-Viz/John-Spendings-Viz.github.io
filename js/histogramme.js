document.addEventListener ("DOMContentLoaded", () => {
    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 445 - margin.left - margin.right,
        height = 445 - margin.top - margin.bottom;

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)

    const y= d3.scaleLinear()
        .range([height, 0])

// append the svg object to the body of the page
    const svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            `translate(${margin.left}, ${margin.top})`);

// Read data
    d3.csv("/data/operations.csv").then (function (data) {
        console.table(data)
        console.log (data [0].libelle)
    })
})