/* On calcule la taille des différents rectangles pour le treemap */
function calculateTreeMap() {
    if (currentYear in data) {
        let root = d3.stratify()
            .id(d => d.category)
            .parentId (d => d.parent)
            (data[currentYear]);
        root.sum(d => +d.totalExpenses)

        d3.treemap()
            .size([treemapWidth, treemapHeight])
            .padding(4)
            (root)
        return root
    }
    return undefined
}

/* Fonction de dessin du treemap (rectangles) */
function drawRectTreeMap(root) {
    /* Options définies par l'utilisateur via les boutons d'options */
    let proportionComparison = currentComparison === "student" ? "proportionStudent" : "proportionFrench"
    let expenses = currentComparison === "student" ? annualExpensesStudent:annualExpensesFrench
    expenses = currentYear === "all" ?expenses*(Object.keys(data).length-1):expenses

    d3.select ("#treemap")
        .select ("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .append("rect")
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr("category", d => d.id)
        .transition()
        .delay(100)
        .duration(500)
        .on('start',function(){ d3.select(this).style("opacity", "0.2")})
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
            let newCategory = d.data.category
            updateCurrentCategory (newCategory)
            updateSelectedCategory (oldCategory)
            updateHistogram()
        })
        .on('mousemove', function (e, d) {
            // on recupere la position de la souris,
            // e est l'object event
            let mousePosition = [e.pageX, e.pageY]
            let expenses_mean = (expenses*d.data[proportionComparison]/100)
            let comparison = ((d.data.totalExpenses - expenses_mean) / expenses_mean * 100)
            // on affiche le tooltip
            d3.select("#tooltip").classed('hidden', d3.select(this).select("g").select(".treemap-legend-category").html() !== "")
                .attr('style', 'left:' + (mousePosition[0] + 10) +
                    'px; top:' + (mousePosition[1] - 50) + 'px')
                .html(`<span style="text-align: center;">${d.data.category} :</span><br /> 
                        ${d.data.totalExpenses} € (${comparison < 0 ? "" : "+"}${comparison.toFixed()} %)`)
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

    /* Affichage du nom de la catégorie */
    d3.select ("#treemap")
        .select ("svg")
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .append("g")
        .append("text")
        .attr ("class", "treemap-legend-category")
        .attr("x", d => d.x0 + (d.x1 - d.x0) / 2)
        .attr("y", d => {
            if (d.y1 - d.y0 > 3 * textScale(d.data.totalExpenses)
                && 0.6*d.data.category.length*0.8*textScale(d.data.totalExpenses) <= d.x1-d.x0) {
                return d.y0 + (d.y1 -d.y0) /2 - 0.3*textScale(d.data.totalExpenses)
            }
            else{
                return d.y0 + (d.y1 - d.y0) / 2
            }
        })
        .transition()
        .delay(100)
        .duration(500)
        .on('start',function(){ d3.select(this).style("opacity", "0")})
        .text(d => {
            if (d.y1 - d.y0 > 3 * textScale(d.data.totalExpenses) && 0.6*d.data.category.length*0.8*textScale(d.data.totalExpenses) <= d.x1-d.x0){
                return d.data.category
            } else { // le texte ne rentre pas dans le rectangle
                return ""
            }
        })
        .attr("font-size", d=> textScale(d.data.totalExpenses)) // on met à l'échelle le texte dans le rectangle
        .style("dominant-baseline", d=> d.y1 - d.y0 > 3* textScale(d.data.totalExpenses)
                && 0.6*d.data.category.length*0.8*textScale(d.data.totalExpenses) <= d.x1-d.x0?"baseline":"middle")
        .on('end',  function(){ d3.select(this).style("opacity", "1"); })

    /* Affichage des données numériques */
    d3.selectAll("g g")
        .data(root.leaves())
        .join("g")
        .append("text")
        .attr ("class", "treemap-legend-comparisons")
        .attr("x", d => d.x0 + (d.x1 - d.x0) / 2)
        .attr("y", d => {
            if (d.y1 - d.y0 > 3* textScale(d.data.totalExpenses)
                && 0.6*d.data.category.length*0.8*textScale(d.data.totalExpenses) <= d.x1-d.x0){
                return d.y0 + (d.y1 -d.y0) / 2 + 0.3*textScale(d.data.totalExpenses)
            }
            else{
                return d.y0 + (d.y1 - d.y0) / 2
            }
        })
        .text(d => {
            if (d.y1 - d.y0 > 3* textScale(d.data.totalExpenses)
                && 0.6*d.data.category.length*0.8*textScale(d.data.totalExpenses) <= d.x1-d.x0){
                let proportionComparison = currentComparison === "student" ? "proportionStudent" : "proportionFrench"
                let expenses = currentComparison === "student" ? annualExpensesStudent:annualExpensesFrench
                expenses = currentYear === "all" ?expenses*(Object.keys(data).length-1):expenses
                let expenses_mean = (expenses*d.data[proportionComparison]/100)
                let comparison = ((d.data.totalExpenses - expenses_mean) / expenses_mean * 100)
                return parseFloat(d.data.totalExpenses).toFixed() + "€ (" + (comparison < 0 ? "" : "+") + comparison.toFixed() + "%)"
            }
        })
        .transition()
        .delay(100)
        .duration(500)
        .on('start',function(){ d3.select(this).style("opacity", "0")})
        .attr("font-size", d => 0.8*textScale(d.data.totalExpenses))
        .on('end',  function(){ d3.select(this).style("opacity", "1"); })
}

/* Fonction à appeler quand on veut redessiner tout le treemap */
function updateTreeMap() {
    treemapWidth = parseFloat(d3.select("#treemap").style("width"))
    treemapHeight = parseFloat(d3.select("#treemap").style("height"))
    let root = calculateTreeMap()
    if (root !== undefined){
        d3.select("#treemap").select("svg").selectAll("*").remove();
        drawRectTreeMap(root)
        drawLabelsTreeMap(root)
    }
    updateSelectedCategory (currentCategory)
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
