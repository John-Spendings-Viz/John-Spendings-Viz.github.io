function drawHistogram() {
    histWidth = parseFloat(d3.select("#histogram").style("width"))
    histHeight = parseFloat(d3.select("#histogram").style("height"))

    let container = d3.select('#histogram')
    let years = [2020,2021]
    let xPadding = 0.045*histWidth
    if (currentYear !== 'all') {
        years = [parseInt(currentYear)]
    }

    container
        .selectAll('svg')
        .data(years)
        .enter()
        .append('svg')
        .attr('width', histWidth)
        .attr('height', currentYear === 'all' ? 0.5*histHeight:histHeight)
        .each(function(d) {
            const width = 0.9*histWidth;
            const height = currentYear === 'all' ? 0.5*histHeight:histHeight;

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
                .attr('x', (d,i) => xPadding + xScale(i))
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
                .attr('x', (d,i) => xScale(i) + xScale.bandwidth()/2 + xPadding)
                .attr('y', (d) => yScale(d))
                .attr('dy', '-0.5vh')
                .attr("class", "barlabel")
                .text((d) => d.toFixed(0))


            // Ligne moyenne
            svg
                .select('g')
                .append('line')
                .attr('stroke-dasharray', "4")
                .attr("x1", xScale.range()[0] + xPadding)
                .attr("x2", xScale.range()[1] + xPadding)
                .attr("y1",  yScale(expenses_month))
                .attr('y2', yScale(expenses_month))
                .attr("stroke", 'royalblue')
                .attr("stroke-width", 2)
                .style("opacity", 1.05*maximum >= expenses_month? 0.5:0)

            // Label moyenne
            svg
                .select('g')
                .append('text')
                .attr('x', xScale.range()[1] + 0.5*xScale.bandwidth() + xPadding)
                .attr('y', yScale(expenses_month))
                .attr("class", "meanlabel")
                .text(comparaison)

            //Legende Axe X
            svg
                .select('g')
                .append('text')
                .attr('x', xScale.range()[1] + 0.5*xScale.bandwidth() + xPadding)
                .attr('y', yScale.range()[0])
                .attr("class", "xlabel")
                .text(d)

            //Legende Axe Y
            svg
                .select('g')
                .append('text')
                .attr('x', xScale.range()[0] + xPadding)
                .attr('y', yScale.range()[1])
                .attr('dy', '-1vh')
                .attr("class", "ylabel")
                .text('Dépenses(€)')

            svg.append('g').call(xAxis)
            svg.append('g').call(yAxis)
            svg.node();


            function xAxis(g) {
                g.attr('transform', `translate(${xPadding}, ${yScale.range()[0]})`)
                    .call(d3.axisBottom(xScale).tickFormat(i => months[i].slice(0, 3)
                        .replace("û", "u")
                        .replace("é", "e")))
                    .attr('class',"xticks")
            }

            function yAxis(g) {
                g.attr('transform', `translate(${xScale.range()[0] + xPadding}, 0)`)
                    .call(d3.axisLeft(yScale).ticks(null, databyMonth.format))
                    .attr('class',"yticks")
            }
        })



}

function updateHistogram() {
    d3.select("#histogram").selectAll("*").remove();
    drawHistogram()
}