function calculateTreeMap() {
    if (currentYear in data) {
        let root = d3.stratify()
            .id(d => d.category)
            .parentId (d => d.parent)
            (data[currentYear]);
        root.sum(d => +d.totalExpenses)

        d3.treemap()
            .size([Math.round(treemapWidth), Math.round(0.9 * treemapHeight)])
            .padding(4)
            (root)
        return root
    }
    return undefined
}

function drawRectTreeMap(root)
{
    let proportionComparison = currentComparison === "student" ? "proportionStudent" : "proportionFrench"
    let expenses = currentComparison === "student" ? annualExpensesStudent:annualExpensesFrench
    expenses = currentYear === "all" ?expenses*(Object.keys(data).length-1):expenses
    let total_expenses = root.value


    d3.select ("#treemap")
        .select ("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .append("rect")
        .transition()
        .delay(100)
        .duration(1000)
        .ease(d3.easeLinear)
        .on('start',function(){ d3.select(this).style("opacity", "0.2")})
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .style("fill", d => colorScale(
                (d.data.totalExpenses - (expenses * d.data[proportionComparison] / 100)) /
                (expenses * d.data[proportionComparison] / 100))
        )
        .on('end',  function(){ d3.select(this).style("opacity", "1"); })
    d3.select ("#treemap")
        .select ("svg")
        .selectAll("g")
        .on("click", function (e, d) {
            let oldCategory = currentCategory
            updateCurrentCategory (d.data.category)
            updateSelectedCategory (this.children [0], oldCategory)
            updateHistogram()
        })
        .on('mousemove', function (e, d) {
        // on recupere la position de la souris,
        // e est l'object event
            let mousePosition = [e.x, e.y]
            let proportions_expenses = (d.data.totalExpenses / total_expenses * 100)
            let expenses_mean = (expenses*d.data[proportionComparison]/100)
            let comparison = ((d.data.totalExpenses - expenses_mean) / expenses_mean * 100)
            let most_expenses = currentYear !== "all"?months [d3.greatestIndex (d.data.expensesByMonth)]: getMaxTuple(d.data.totalExpensesByYear)
            let value_most_expenses = currentYear !== "all"? d3.max (d.data.expensesByMonth):Math.max(...d.data.totalExpensesByYear.map(d=> d[1]))
            // on affiche le tooltip
            d3.select("#tooltip").classed('hidden', false)
                .attr('style', 'left:' + (mousePosition[0] + 15) +
                    'px; top:' + (mousePosition[1] - 35) + 'px')
                // on recupere le nom du département et le nombre d'hospitalisations associé // FIXME
                .html(`<h3>${d.data.category} : </h3><ul>
                                        <li>Dépenses Totales : ${d.data.totalExpenses} €</li>
                                        <li>Dépenses totales moyenne des ${currentComparison === "student" ? "étudiants" : "français"} : ${expenses_mean.toFixed(2)} €</li>
                                        <li>Comparaison par rapport aux ${currentComparison === "student" ? "étudiants" : "français"} : 
                                            ${comparison < 0 ? "" : "+"}${comparison.toFixed(1)} %</li>
                                        <li>Proportion des dépenses : ${proportions_expenses.toFixed(1)} %</li>
                                        <li>Proportion pour les ${currentComparison === "student" ? "étudiants" : "français"} : ${d.data[proportionComparison].toFixed(1)} %</li>
                                        <li>${currentYear !== "all" ?"Mois le plus dépensier : ":"Année la plus dépensière : "} ${most_expenses} (${value_most_expenses} €)</li>
                                        </ul>`)
        })
        .on('mouseout', function () {
            // on cache le tooltip
            d3.select("#tooltip").classed('hidden', true)
        })
}

function drawLabelsTreeMap(root){
    const textScale = d3.scaleSqrt()
        .domain([0, d3.max(root, d => parseFloat(d.data.totalExpenses))])
        .range([8, 0.8*d3.max(root, d=> (d.x1-d.x0)/d3.max(root, d=> d.data.category.length))]);

    // and to add the text labels
    d3.select ("#treemap")
        .select ("svg")
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .append("g")
        .append("text")
        .transition()
        .delay(100)
        .duration(1000)
        .ease(d3.easeLinear)
        .attr ("class", "treemap-legend-category")
        .attr("x", d => d.x0 + (d.x1 - d.x0) / 2)
        .attr("y", d => {
            if (d.y1 - d.y0 > 3* textScale(d.data.totalExpenses) && 0.5*d.data.category.length*0.8*textScale(d.data.totalExpenses) <= d.x1-d.x0) {
                return d.y0 + (d.y1 -d.y0) /2 - 0.3*textScale(d.data.totalExpenses)
            }
            else{
                return d.y0 + (d.y1 - d.y0) / 2
            }
        })
        .text(d => {
            if (textScale(d.data.totalExpenses) >= 12 && d.y1 - d.y0 > textScale(d.data.totalExpenses) && 0.5*d.data.category.length*0.8*textScale(d.data.totalExpenses) <= d.x1-d.x0){
                return d.data.category
            }
            else{
                return ""
            }
        })
        .attr("font-size", d=> textScale(d.data.totalExpenses))
        .style("dominant-baseline", d=> d.y1 - d.y0 > 3* textScale(d.data.totalExpenses) && 0.5*d.data.category.length*0.8*textScale(d.data.totalExpenses) <= d.x1-d.x0 ?"baseline":"middle")

    d3.selectAll("g g")
        .data(root.leaves())
        .join("g")
        .append("text")
        .transition()
        .delay(100)
        .duration(1000)
        .ease(d3.easeLinear)
        .attr ("class", "treemap-legend-comparisons")
        .attr("x", d => d.x0 + (d.x1 - d.x0) / 2)    // +10 to adjust position (more right)
        .attr("y", d => {
            if (d.y1 - d.y0 > 3* textScale(d.data.totalExpenses) && 0.5*d.data.category.length*0.8*textScale(d.data.totalExpenses) <= d.x1-d.x0) {
                return d.y0 + (d.y1 -d.y0) / 2 + 0.3*textScale(d.data.totalExpenses)
            }
            else{
                return d.y0 + (d.y1 - d.y0) / 2
            }
        })   // +20 to adjust position (lower)
        .text(d => {
            if (d.y1 - d.y0 > 3* textScale(d.data.totalExpenses) && 0.5*d.data.category.length*0.8*textScale(d.data.totalExpenses) <= d.x1-d.x0) {
                let proportionComparison = currentComparison === "student" ? "proportionStudent" : "proportionFrench"
                let expenses = currentComparison === "student" ? annualExpensesStudent:annualExpensesFrench
                expenses = currentYear === "all" ?expenses*(Object.keys(data).length-1):expenses
                let expenses_mean = (expenses*d.data[proportionComparison]/100)
                let comparison = ((d.data.totalExpenses - expenses_mean) / expenses_mean * 100)
                return parseFloat(d.data.totalExpenses).toFixed() + "€ (" + (comparison < 0 ? "" : "+") + comparison.toFixed() + "%)"
            }
        })
        .attr("font-size", d => 0.8*textScale(d.data.totalExpenses))
}

function updateTreeMap() {
    let root = calculateTreeMap()
    if (root !== undefined){
        d3.select("#treemap").select("svg").selectAll("*").remove();
        drawRectTreeMap(root)
        drawLabelsTreeMap(root)
    }
    return root
}

function drawTreeMap(){
    treemapWidth = parseFloat(d3.select("#treemap").style("width"))
    treemapHeight = parseFloat(d3.select("#treemap").style("height"))
    d3.select("#treemap")
        .append ("svg")
    let root = calculateTreeMap()
    if (root !== undefined) {
        drawRectTreeMap(root)
        drawLabelsTreeMap(root)
    }
}
