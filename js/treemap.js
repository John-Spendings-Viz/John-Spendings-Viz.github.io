function calculateTreeMap(year) {
    if (year in data) {
        let root = d3.stratify()
            .id(d => d.category)
            .parentId (d => d.parent)
            (data[year]);
        root.sum(d => +d.totalExpenses)

        d3.treemap()
            .size([Math.round(0.9 * treemapWidth), Math.round(0.9 * treemapHeight)])
            .padding(4)
            (root)
        return root
    }
    return undefined
}

function drawRectTreeMap(comparaison, root, annee)
{
    let proportionComparison = comparaison === "student" ? "proportionStudent" : "proportionFrench"
    let expenses = comparaison === "student" ? annualExpensesStudent:annualExpensesFrench
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
            (d.data.totalExpenses - (expenses * d.data[proportionComparison] / 100)) /
            (expenses * d.data[proportionComparison] / 100)))
        .on('end',  function(){ d3.select(this).style("opacity", "1"); });
    d3.select("svg")
        .selectAll("rect")
        .on('mousemove', function (e, d) {
        // on recupere la position de la souris,
        // e est l'object event
            let mousePosition = [e.x, e.y]
            let proportions_expenses = (d.data.totalExpenses / total_expenses * 100)
            let expenses_mean = (expenses*d.data[proportionComparison]/100)
            let comparison = ((d.data.totalExpenses - expenses_mean) / expenses_mean * 100)
            let most_expenses = annee !== "all"?months [d3.greatestIndex (d.data.expensesByMonth)]: getMaxTuple(d.data.totalExpensesByYear)
            let value_most_expenses = annee !== "all"? d3.max (d.data.expensesByMonth):Math.max(...d.data.totalExpensesByYear.map(d=> d[1]))
            // on affiche le tooltip
            d3.select("#tooltip").classed('hidden', false)
                .attr('style', 'left:' + (mousePosition[0] + 15) +
                    'px; top:' + (mousePosition[1] - 35) + 'px')
                // on recupere le nom du département et le nombre d'hospitalisations associé // FIXME
                .html(`<h3>${d.data.category} : </h3><ul>
                                        <li>Dépenses Totales : ${d.data.totalExpenses} €</li>
                                        <li>Dépenses totales moyenne des ${comparaison === "student" ? "étudiants" : "français"} : ${expenses_mean.toFixed(2)} €</li>
                                        <li>Comparaison par rapport aux ${comparaison === "student" ? "étudiants" : "français"} : 
                                            ${comparison < 0 ? "" : "+"}${comparison.toFixed(1)} %</li>
                                        <li>Proportion des dépenses : ${proportions_expenses.toFixed(1)} %</li>
                                        <li>Proportion pour les ${comparaison === "student" ? "étudiants" : "français"} : ${d.data[proportionComparison].toFixed(1)} %</li>
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
        .attr ("class", "treemap-legend")
        .attr("x", d => d.x0 + (d.x1 - d.x0) / 2)    // +10 to adjust position (more right)
        .attr("y", d => d.y0 + (d.y1 - d.y0) / 2)   // +20 to adjust position (lower)
        .text(d => Math.min((d.y1 - d.y0)*0.75, (d.x1 - d.x0) / d.data.category.length * 1.5) >= 12 ? d.data.category : "")
        .attr("font-size", d => Math.min((d.y1 - d.y0)*0.75, (d.x1 - d.x0) / d.data.category.length * 1.5))
}

function updateTreeMap(annee, comparaison) {
    let root = calculateTreeMap(annee)
    if (root !== undefined){
        d3.select("svg").selectAll("*").remove();
        drawRectTreeMap(comparaison, root, annee)
        drawLabelsTreeMap(root)
    }
}
