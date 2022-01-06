document.addEventListener ("DOMContentLoaded", () => {

    d3.select("#treemap")
        .append("svg")
        .attr("width", treemapWidth)
        .attr("height", treemapHeight)

    d3.select("body")
        .append("div")
        .attr("class", "tooltip hidden")
        .attr("id", "tooltip")

    d3.csv("../data/repartition_categories.csv").then(function (repartition) {
        d3.csv("../data/operations.csv").then(function (operations) {
            cleaned_operations = operations.filter(d => d.categorie !== "");
            let grouped_data = d3.group(cleaned_operations, d => parseDate(d.date).getFullYear(), d => d.categorie, d => parseDate(d.date).getMonth())
            for (let annee of grouped_data) {
                let nestedData = []
                for (let category of annee[1]) {
                    let sum_month = []
                    for (let month = 0; month <= 11; month++) {
                        sum_month.push((category[1].get(month) !== undefined ? d3.sum(category[1].get(month), x => x.montant) : 0).toFixed(2))
                    }
                    nestedData.push({
                        categorie: category[0],
                        parent: "Origin",
                        somme: parseFloat(d3.sum(sum_month).toFixed(2)),
                        somme_mois: sum_month.map(x => parseFloat(x)),
                        proportionEtudiants: parseFloat(repartition.find(d => d.Catégorie === category[0]).Etudiants),
                        proportionFrancais: parseFloat(repartition.find(d => d.Catégorie === category[0]).Français)
                    })
                }
                nestedData.push({categorie: "Origin", parent: "", somme: ""})
                data[annee[0]] = nestedData
            }

            nestedData = d3.rollups(
                cleaned_operations,
                xs => d3.sum(xs, x => x.montant).toFixed(2),
                d => d.categorie, d=> parseDate(d.date).getFullYear()
            )
                .map(([category, somme]) => ({categorie: category, parent:"Origin", somme: d3.sum(somme, x=>x[1]).toFixed(2),
                    somme_annee:somme.map(d=>[parseInt(d[0]), parseFloat(d[1])]),
                    proportionEtudiants: parseFloat(repartition.find(d => d.Catégorie === category).Etudiants),
                    proportionFrancais: parseFloat(repartition.find(d => d.Catégorie === category).Français)}
                ))
            nestedData.push({categorie: "Origin", parent: "", somme: ""})
            data["all"] = nestedData

            let root = calculateTreeMap(currentYear)
            if (root !== undefined) {
                drawRectTreeMap("students", root, currentYear)
                drawLabelsTreeMap(root)
            }
            d3.selectAll("input[name='choix_comparaison']").on("change", function () {
                updateCurrentComparison(this.value)
                updateTreeMap(currentYear, currentComparison)
            })

            d3.selectAll("input[name='choix_annee']").on("change", function () {
                updateCurrentYear(this.value)
                updateTreeMap(currentYear, currentComparison)
            })

            f()
        })
    })
})