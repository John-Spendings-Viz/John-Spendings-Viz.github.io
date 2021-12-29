document.addEventListener ("DOMContentLoaded", () => {

    let svg = d3.select("#treemap")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .append("g")

    let color = d3
        .scaleQuantize()
        .range(["#006D2C", "#31a354", "#FFD700", "#ff7f00", "#FF0000"]);


    d3.csv("../data/repartition_categories.csv").then(function (repartition){
        d3.csv("../data/operations.csv").then(function (operations){
            cleaned_operations = operations.filter(d => d.categorie !== "");
            // stratify the data: reformatting for d3.js
            let nestedData = d3.rollups(
                cleaned_operations,
                xs => d3.sum(xs, x => x.montant).toFixed(2),
                d => d.categorie
            )
                .map(([k, v]) => ({ categorie: k, parent:"Origin", value: v,
                    proportionEtudiant: repartition.find(d=>d.Catégorie === k).Etudiants,
                    proportionFrancais: repartition.find(d=>d.Catégorie === k).Français}))
            nestedData.push({ categorie: "Origin", parent:"", value: "" })

            const root = d3.stratify()
                .id(function(d) { return d.categorie; })   // Name of the entity (column name is name in csv)
                .parentId(function(d) { return d.parent; })   // Name of the parent (column name is parent in csv)
                (nestedData);
            root.sum(function(d) { return +d.value })   // Compute the numeric value for each entity

            let total_expenses = root.value
            color.domain([0, 2])

            d3.treemap()
                .size([Math.round(0.9*parseFloat(d3.select("svg").style("width"))), Math.round(0.9*parseFloat(d3.select("svg").style("height")))])
                .padding(4)
                (root)

            svg
                .selectAll("rect")
                .data(root.leaves())
                .join("rect")
                .attr('x', function (d) { return d.x0; })
                .attr('y', function (d) { return d.y0; })
                .attr('width', function (d) { return d.x1 - d.x0; })
                .attr('height', function (d) { return d.y1 - d.y0; })
                .style("stroke", "black")
                .style("fill", function (d) {return color(d.data.value/total_expenses/(d.data.proportionEtudiant/100))})

            // and to add the text labels
            svg
                .selectAll("text")
                .data(root.leaves())
                .join("text")
                .attr("x", function(d){ return d.x0+10})    // +10 to adjust position (more right)
                .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
                .text(function(d){ return d.data.categorie})
                .attr("font-size", "15px")
                .attr("fill", "white")
        })
    })
})