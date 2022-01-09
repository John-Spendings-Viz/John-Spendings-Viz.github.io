function f(){

    //console.log(data[2020].find(d=> d.category === currentCategory))
    const databyMonth = data[2020].find(d=> d.category === currentCategory).expensesByMonth;
    //let proportionComparison = currentComparison === "student" ? "proportionStudent" : "proportionFrench"
    let comparaison = currentComparison === "student" ? "Etudiants":"Français"
    let expenses = currentComparison === "student" ? annualExpensesStudent:annualExpensesFrench
    let proportion = currentComparison === "student" ?
        data[2020].find(d=> d.category === currentCategory).proportionStudent :
        data[2020].find(d=> d.category === currentCategory).proportionFrench
    let expenses_month = (expenses * (proportion / 100)) / 12
    var maximum = Math.max.apply(null, databyMonth);
    console.log(data[2020])
    console.log(expenses_month)


    //expenses = currentYear === "all" ?expenses*(Object.keys(data).length-1):expenses
    //console.log(data[2020].find(d=> d.category === currentCategory).proportionFrench)

    const data2 = [
        { name: 'Simon', score: 80},
        { name: 'Mary', score: 90},
        { name: 'John', score: 60}
    ]

    const width = 1000;
    const height = 400;
    const margin = { top: 50, bottom: 50, left: 50, right: 50 };

    const svg = d3.select('#histogram')
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

    svg
        .append('g')
        .selectAll('rect')
        .data(databyMonth)
        .join('rect')
        .attr('x', (d,i) => x(i))
        .attr('y', (d) => y(d))
        .attr('height', (d) => y(0) - y(d))
        .attr('width', x.bandwidth())
        .style("fill", d => colorScale(
            (d - expenses_month) / expenses_month
            )
        );

    svg
        .selectAll('g')
        .append('rect')
        .attr('x', x(0))
        .attr('y', y(expenses_month))
        .attr('height', 4)
        .attr('width', width - margin.left - margin.right)
        .attr("fill", 'royalblue')

    svg
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

    svg.append('g').call(xAxis)
    svg.append('g').call(yAxis)
    svg.node();


}
