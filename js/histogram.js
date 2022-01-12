function drawHistogram() {
    histWidth = parseFloat(d3.select("#histogram").style("width"))
    histHeight = parseFloat(d3.select("#histogram").style("height"))

    let container = d3.select('#histogram')
    let years = [2020,2021]
    if (currentYear !== 'all') {
        years = [parseInt(currentYear)]
    }

    container
        .selectAll('svg')
        .data(years)
        .enter()
        .append('svg')
        .attr('width', histWidth)
        .attr('height', currentYear === 'all' ? 0.5*histHeight:0.85*histHeight)
        .each(function(d) {
            const width = 0.9*histWidth;
            const height = currentYear === 'all' ? 0.5*histHeight:0.85*histHeight;

            let comparaison = currentComparison === "student" ? "Etudiants":"Français"
            let expenses = currentComparison === "student" ? annualExpensesStudent:annualExpensesFrench
            let proportion = 100
            let databyMonth = []

            // cas 1 : categorie == all
            if (currentCategory === "all") {
                databyMonth = buildDataByMonthJohn(d);
            }

            //cas 2 : categorie != all
            else {
                databyMonth = data[d].find(d=> d.category === currentCategory).expensesByMonth;
                proportion = currentComparison === "student" ?
                    data[d].find(d=> d.category === currentCategory).proportionStudent :
                    data[d].find(d=> d.category === currentCategory).proportionFrench
            }
            let expenses_month = (expenses * (proportion / 100)) / 12
            let maximum = d3.max(databyMonth.concat(expenses_month))

            const xScale = d3.scaleBand()
                .domain(d3.range(databyMonth.length))
                .range([0.1*width, 0.9*width])
                .padding(0.1)

            const yScale = d3.scaleLinear()
                .domain([0,maximum])
                .range([0.8*height,0.2*height]);

            let svg = d3.select(this)

            // Bar Chart
            svg
                .append('g')
                .selectAll('rect')
                .data(databyMonth)
                .join('rect')
                .attr('x', (d,i) => xScale(i))
                .attr('y', (d) => yScale(d))
                .attr('height', (d) => yScale(0) - yScale(d))
                .attr('width', xScale.bandwidth())
                .style("stroke", "black")
                .style("fill", d => colorScale(
                        (d - expenses_month) / expenses_month
                    )
                )

            // Label bar
            svg
                .selectAll('g')
                .selectAll("text")
                .data(databyMonth)
                .join("text")
                .attr('x', (d,i) => xScale(i) + xScale.bandwidth()/2)
                .attr('y', (d) => yScale(d) - 5)
                .style("text-anchor", "middle")
                .text((d) => d.toFixed(0))
                .attr("font-size", histWidth<300?15:10)

            // Ligne moyenne
            svg
                .select('g')
                .append('line')
                .attr('stroke-dasharray', "4")
                .attr("x1", xScale.range()[0])
                .attr("x2", xScale.range()[1])
                .attr("y1",  yScale(expenses_month))
                .attr('y2', yScale(expenses_month))
                .attr("stroke", 'royalblue')
                .attr("stroke-width", 2)
                .style("opacity", 1.05*maximum >= expenses_month? 0.5:0)

            // Label moyenne
            svg
                .select('g')
                .append('text')
                .attr('x', xScale.range()[1] + 0.5*xScale.bandwidth())
                .attr('y', yScale(expenses_month))
                .style("dominant-baseline", "middle")
                .attr("font-size", histWidth<300?20:15)
                .text(comparaison)

            //Legende Axe X
            svg
                .select('g')
                .append('text')
                .attr('x', xScale.range()[1] + 0.5*xScale.bandwidth())
                .attr('y', yScale.range()[0])
                .attr("font-size", histWidth<300?30:20)
                .style("dominant-baseline", "baseline")
                .text(d)

            //Legende Axe Y
            svg
                .select('g')
                .append('text')
                .attr('x', 0)
                .attr('y', yScale.range()[1] - 15)
                .attr("font-size", 15)
                .text('Dépenses(€)')

            svg.append('g').call(xAxis)
            svg.append('g').call(yAxis)
            svg.node();


            function xAxis(g) {
                g.attr('transform', `translate(0, ${yScale.range()[0]})`)
                    .call(d3.axisBottom(xScale).tickFormat(i => months[i].slice(0, 3)
                        .replace("û", "u")
                        .replace("é", "e")))
                    .attr('font-size',histWidth<300?15:10)
            }

            function yAxis(g) {
                g.attr('transform', `translate(${xScale.range()[0]}, 0)`)
                    .call(d3.axisLeft(yScale).ticks(null, databyMonth.format))
                    .attr('font-size',histWidth<300?17:12)

            }
        })



}

function updateHistogram() {
    d3.select("#histogram").selectAll("*").remove();
    drawHistogram()
}