function drawHistogram(){

    console.log(data[2020])
    let comparaison = currentComparison === "student" ? "Etudiants":"Français"
    let expenses = currentComparison === "student" ? annualExpensesStudent:annualExpensesFrench
    let proportion = 100
    let databyMonth = []

    // cas 1 : categorie == all
    if (currentCategory === "all") {
        databyMonth = buildDataByMonthJohn(currentYear);
    }

    //cas 2 : categorie != all
    else {
        databyMonth = data[2020].find(d=> d.category === currentCategory).expensesByMonth;
        proportion = currentComparison === "student" ?
            data[2020].find(d=> d.category === currentCategory).proportionStudent :
            data[2020].find(d=> d.category === currentCategory).proportionFrench
    }
    let expenses_month = (expenses * (proportion / 100)) / 12
    var maximum = Math.max.apply(null, databyMonth);


    const width = 1000;
    const height = 400;
    const margin = { top: 50, bottom: 50, left: 50, right: 50 };

    //const svg = d3.select('#histogram')
    d3.select("#histogram")
        .append('svg')
        .attr('height', height - margin.top - margin.bottom)
        .attr('width', width - margin.left - margin.right)
        .attr('viewBox', [0,0, width, height]);

    const x = d3.scaleBand()
        .domain(d3.range(databyMonth.length))
        .range([margin.left, width - margin.right])
        .padding(0.1)

    const y = d3.scaleLinear()
        .domain([0,maximum])
        .range([height - margin.bottom, margin.top]);

    // Bar Chart
    d3.select("svg")
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
    d3.select("svg")
        .selectAll('g')
        .selectAll("text")
        .data(databyMonth)
        .join("text")
        .attr('x', (d,i) => x(i) + 15)
        .attr('y', (d) => y(d) - 10)
        .text((d) => d.toFixed(0))
        .attr("font-size", 20)

    // Ligne moyenne
    d3.select("svg")
        .selectAll('g')
        .append('rect')
        .attr('x', x(0) - 8)
        .attr('y', y(expenses_month))
        .attr('height', 4)
        .attr('width', width - margin.left - margin.right)
        .attr("fill", 'royalblue')

    // Label moyenne
    d3.select("svg")
        .selectAll('g')
        .append('text')
        .attr('x', x(11) + 90)
        .attr('y', y(expenses_month) + 6)
        .attr('height', 4)
        .attr('width', width - margin.left - margin.right)
        .text(comparaison)



    function xAxis(g) {
        g.attr('transform', `translate(0, ${height- margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat(i => months[i]))
            .attr('font-size','15px')
    }

    function yAxis(g) {
        g.attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y).ticks(null, databyMonth.format))
            .attr('font-size','20px')

    }

    d3.select("svg").append('g').call(xAxis)
    d3.select("svg").append('g').call(yAxis)
    d3.select("svg").node();

}

function updateHistogram() {
    d3.select("svg").selectAll("*").remove();
    drawHistogram()
}
