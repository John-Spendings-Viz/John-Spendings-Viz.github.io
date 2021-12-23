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
    d3.csv("/data/operations.csv", (links) => {
        console.log(links)
        var libelle = links.columns[0];
        var date = links.columns[1];
        var montant = links.columns[2];
        var categorie = links.columns[3];
        stratify = d3.stratify()
            .id(d => d[libelle])
            .parentId(d => d[parent])
            .date(d => d[date])
        var root = stratify(links)
        console.log(root)
    }).then (r => {

    });
})