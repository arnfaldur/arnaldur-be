using CairoMakie
using JSON
using PrettyTables

addition = open("output/addition-200") do file
    read(file, String) |> JSON.parse |> x -> hcat(x...)
end
sub = open("output/sub-200") do file
    read(file, String) |> JSON.parse |> x -> hcat(x...)
end
mult = open("output/mult-200") do file
    read(file, String) |> JSON.parse |> x -> hcat(x...)
end

function matmap(mat)
    with_theme(theme_dark()) do
        fig = Figure(size=(700,600))
        ax = Axis(fig[1,1], xlabel="x", ylabel="y");
        hm = heatmap!(mat; colormap=:Spectral_11);
        Colorbar(fig[:,end+1], hm; ticksize=5);
        colsize!(fig.layout, 1, Aspect(1, 1.0))
        return fig;
    end
end

save("addition.png", matmap(addition))
save("sub.png", matmap(sub))
save("mult.png", matmap(mult))


# rawtable = hcat(1:96,llama_8b,llama_70b,qwen,yi,mistral,command_r)
# header = ["Query", "Llama 8B", "Llama 70B", "Qwen-1.5-32B", "Yi-1.5-34B", "Mistral-7B-v0.3", "Command-R"]
# hl_lt = HtmlHighlighter((data, i, j)->(data[i,j] < data[i,1]), HtmlDecoration(color="blue"));
# hl_gt = HtmlHighlighter((data, i, j)->(data[i,j] > data[i,1]), HtmlDecoration(color="red"));
# io = IOBuffer()
# pretty_table(io, rawtable; backend=Val(:html), header=header, highlighters=(hl_gt, hl_lt))
# html_table = String(take!(io))
# html_table = replace(
#     html_table,
#     " style = \"color: blue; " => " class=\"lesser\" style=\"",
#     " style = \"color: red; " => " class=\"greater\" style=\"")
# html_table = replace(
#     html_table,
#     r" style *= *\".*\"" => "",
#     "<tr class = \"header headerLastRow\">" => "<tr>")
# html_table =
#     "export default function Table() {\n\treturn (\n\t" *
#     html_table[1:6] *
#     " class=\"llmr-numbers\"" *
#     html_table[7:end] *
#     "\n)}"
# open("Table.tsx", "w") do io
#     println(io, html_table)
# end
# save("table.html", html_table)
