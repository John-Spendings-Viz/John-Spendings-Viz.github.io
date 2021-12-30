function calculateTreeMap(annee) {
    if (annee in data) {
        let root = d3.stratify()
            .id(function (d) {
                return d.categorie;
            })   // Name of the entity (column name is name in csv)
            .parentId(function (d) {
                return d.parent;
            })   // Name of the parent (column name is parent in csv)
            (data[annee]);
        root.sum(function (d) {
            return +d.somme
        })   // Compute the numeric value for each entity

        d3.treemap()
            .size([Math.round(0.9 * parseFloat(d3.select("svg").style("width"))), Math.round(0.9 * parseFloat(d3.select("svg").style("height")))])
            .padding(4)
            (root)
        return root
    }
    return undefined
}

function drawRectTreeMap(comparaison, root, annee)
{
    let proportionComparison = comparaison === "etudiants" ? "proportionEtudiants" : "proportionFrancais"
    let expenses = comparaison === "etudiants" ? annual_expenses_student:annual_expenses_french
    expenses = annee === "all" ?expenses*(Object.keys(data).length-1):expenses
    let total_expenses = root.value

    d3.select("svg")
        .selectAll("rect")
        .data(root.leaves())
        .join("rect")
        .transition()
        .delay(100)
        .duration(1000)
        .ease(d3.easeLinear)
        .on('start',function(){ d3.select(this).style("opacity", "0.2")})
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .style("stroke", "black")
        .style("fill", d => color(
            (d.data.somme - (expenses * d.data[proportionComparison] / 100)) /
            (expenses * d.data[proportionComparison] / 100)))
        .on('end',  function(){ d3.select(this).style("opacity", "1"); });

    d3.select("svg")
        .selectAll("rect")
        .on('mousemove', function (e, d) {
        // on recupere la position de la souris,
        // e est l'object event
            let mousePosition = [e.x, e.y]
            let proportions_expenses = (d.data.somme / total_expenses * 100)
            let expenses_mean = (expenses*d.data[proportionComparison]/100)
            let comparison = ((d.data.somme - expenses_mean) / expenses_mean * 100)
            let most_expenses = annee !== "all"? months[d.data.somme_mois.indexOf(Math.max(...d.data.somme_mois))]: getMaxTuple(d.data.somme_annee)
            let value_most_expenses = annee !== "all"? Math.max(...d.data.somme_mois):Math.max(...d.data.somme_annee.map(d=> d[1]))

            // on affiche le tooltip
            d3.select("#tooltip").classed('hidden', false)
                .attr('style', 'left:' + (mousePosition[0] + 15) +
                    'px; top:' + (mousePosition[1] - 35) + 'px')
                // on recupere le nom du département et le nombre d'hospitalisations associé
                .html(`<h3>${d.data.categorie} : </h3><ul>
                                        <li>Dépenses Totales : ${d.data.somme} €</li>
                                        <li>Dépenses totales moyenne des ${comparaison === "etudiants" ? "étudiants" : "français"} : ${expenses_mean.toFixed(2)} €</li>
                                        <li>Comparaison par rapport aux ${comparaison === "etudiants" ? "étudiants" : "français"} : 
                                            ${comparison < 0 ? "" : "+"}${comparison.toFixed(1)} %</li>
                                        <li>Proportion des dépenses : ${proportions_expenses.toFixed(1)} %</li>
                                        <li>Proportion pour les ${comparaison === "etudiants" ? "étudiants" : "français"} : ${d.data[proportionComparison].toFixed(1)} %</li>
                                        <li>${annee !== "all" ?"Mois le plus dépensier : ":"Année la plus dépensière : "} ${most_expenses} (${value_most_expenses} €)</li>
                                        </ul>`)
        })
        .on('mouseout', function () {
            // on cache le tooltip
            d3.select("#tooltip").classed('hidden', true)
        })
}

function drawLabelsTreeMap(root){
    // and to add the text labels
    d3.select("svg")
        .selectAll("text")
        .data(root.leaves())
        .join("text")
        .transition()
        .delay(100)
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("x", d => d.x0 + (d.x1 - d.x0) / 2)    // +10 to adjust position (more right)
        .attr("y", d => d.y0 + (d.y1 - d.y0) / 2)   // +20 to adjust position (lower)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(d => Math.min((d.y1 - d.y0)*0.75, (d.x1 - d.x0) / d.data.categorie.length * 1.5) >= 12 ? d.data.categorie : "")
        .attr("font-size", d => Math.min((d.y1 - d.y0)*0.75, (d.x1 - d.x0) / d.data.categorie.length * 1.5))
        .attr("fill", "white")
}

function updateTreeMap(annee, comparaison) {
    let root = calculateTreeMap(annee)
    if (root !== undefined){
        d3.select("svg").selectAll("*").remove();
        drawRectTreeMap(comparaison, root, annee)
        drawLabelsTreeMap(root)
    }
}