function drawHistogram() {

    const Width = 1150;
    const Height = 700;
    const Margin = { top: 50, bottom: 50, left: 50, right: 50 };

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
        .attr('height', Height - Margin.top - Margin.bottom)
        .attr('width', Width - Margin.left - Margin.right)
        // .attr('viewBox', [0,0, width, height])
        .each(function(d) {
            const width = 1050;
            const height = currentYear === 'all' ? 350:600;
            const margin = { top: 50, bottom: 50, left: 50, right: 50 };

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
            var maximum = Math.max.apply(null, databyMonth);

            const x = d3.scaleBand()
                .domain(d3.range(databyMonth.length))
                .range([margin.left, width - margin.right])
                .padding(0.1)

            const y = d3.scaleLinear()
                .domain([0,maximum])
                .range([height - margin.bottom, margin.top]);

            let svg = d3.select(this)
            svg
                .attr('height', height - margin.top - margin.bottom)
                .attr('width', width - margin.left - margin.right)
                .attr('viewBox', [0,0, width, height]);

            // Bar Chart
            svg
                .append('g')
                .selectAll('rect')
                .data(databyMonth)
                .join('rect')
                .attr('x', (d,i) => x(i))
                .attr('y', (d) => y(d))
                .attr('height', (d) => y(0) - y(d))
                .attr('width', x.bandwidth())
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
                .attr('x', (d,i) => x(i) + 15)
                .attr('y', (d) => y(d) - 10)
                .text((d) => d.toFixed(0))
                .attr("font-size", 25)

            // Ligne moyenne
            svg
                .selectAll('g')
                .append('rect')
                .attr('x', x(0) - 8)
                .attr('y', y(expenses_month))
                .attr('height', 3)
                .attr('width', width - margin.left - margin.right)
                .attr("fill", 'royalblue')

            // Label moyenne
            svg
                .selectAll('g')
                .append('text')
                .attr('x', x(11) + 90)
                .attr('y', y(expenses_month) + 6)
                .attr('height', 4)
                .attr('width', width - margin.left - margin.right)
                .attr("font-size", 25)
                .text(comparaison)

            //Legende Axe X
            svg
                .selectAll('g')
                .append('text')
                .attr('x', x(11) + 90)
                .attr('y', height - margin.bottom + 5)
                .attr('height', 4)
                .attr('width', width - margin.left - margin.right)
                .attr("font-size", 30)
                .text(d)

            //Legende Axe Y
            svg
                .selectAll('g')
                .append('text')
                .attr('x', -30)
                .attr('y', margin.top - 15)
                .attr('height', 4)
                .attr('width', width - margin.left - margin.right)
                .attr("font-size", 25)
                .text('Depenses(€)')

            svg.append('g').call(xAxis)
            svg.append('g').call(yAxis)
            svg.node();


            function xAxis(g) {
                g.attr('transform', `translate(0, ${height- margin.bottom})`)
                    .call(d3.axisBottom(x).tickFormat(i => months[i]))
                    .attr('font-size','17px')
            }

            function yAxis(g) {
                g.attr('transform', `translate(${margin.left}, 0)`)
                    .call(d3.axisLeft(y).ticks(null, databyMonth.format))
                    .attr('font-size','20px')

            }

        })



}

function updateHistogram() {
    d3.select("#histogram").selectAll("*").remove();
    drawHistogram()
}
