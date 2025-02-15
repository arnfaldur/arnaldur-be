using CairoMakie
using JSON
using PrettyTables

llama_8b = open("llama-8b") do file
    read(file, String) |> JSON.parse
end
llama_70b = open("llama-70b") do file
    read(file, String) |> JSON.parse
end
qwen = open("qwen-1.5-32b-chat") do file
    read(file, String) |> JSON.parse
end
yi = open("yi-1.5-34b-chat") do file
    read(file, String) |> JSON.parse
end
mistral = open("mistral-7b-v0.3") do file
    read(file, String) |> JSON.parse
end
command_r = open("command-r") do file
    read(file, String) |> JSON.parse
end

with_theme(theme_dark()) do
   fig = Figure(size=(1000,1500), fontsize=24);
   ticks=0:16:96
   ax = Axis(fig[1,1], xticks=ticks, yticks=ticks,ylabel="Response",xlabel="Query",title="Llama 8B");
   lines!(1:96, linewidth=1, color=:red);
   scatter!(llama_8b, markersize = 8.0);
   ax = Axis(fig[1,2], xticks=ticks, yticks=ticks,ylabel="Response",xlabel="Query",title="Llama 70B");
   lines!(1:96, linewidth=1, color=:red);
   scatter!(llama_70b, markersize = 8.0);
   ax = Axis(fig[2,1], xticks=ticks, yticks=ticks,ylabel="Response",xlabel="Query",title="Qwen-1.5-32B");
   lines!(1:96, linewidth=1, color=:red);
   scatter!(qwen, markersize = 8.0);
   ax = Axis(fig[2,2], xticks=ticks, yticks=0:16:192,ylabel="Response",xlabel="Query",title="Yi-1.5-34B");
   lines!(1:96, linewidth=1, color=:red);
   scatter!(yi, markersize = 8.0);
   ax = Axis(fig[3,1], xticks=ticks, yticks=ticks,ylabel="Response",xlabel="Query",title="Mistral-7B-v0.3");
   lines!(1:96, linewidth=1, color=:red);
   scatter!(mistral, markersize = 8.0);
   ax = Axis(fig[3,2], xticks=ticks, yticks=ticks,ylabel="Response",xlabel="Query",title="Command-R");
   lines!(1:96, linewidth=1, color=:red);
   scatter!(command_r, markersize = 8.0);
   save("plots.svg", fig)
end

rawtable = hcat(1:96,llama_8b,llama_70b,qwen,yi,mistral,command_r)
header = ["Query", "Llama 8B", "Llama 70B", "Qwen-1.5-32B", "Yi-1.5-34B", "Mistral-7B-v0.3", "Command-R"]
hl_lt = HtmlHighlighter((data, i, j)->(data[i,j] < data[i,1]), HtmlDecoration(color="blue"));
hl_gt = HtmlHighlighter((data, i, j)->(data[i,j] > data[i,1]), HtmlDecoration(color="red"));
io = IOBuffer()
pretty_table(io, rawtable; backend=Val(:html), header=header, highlighters=(hl_gt, hl_lt))
html_table = String(take!(io))
html_table = replace(
    html_table,
    " style = \"color: blue; " => " class=\"lesser\" style=\"",
    " style = \"color: red; " => " class=\"greater\" style=\"")
html_table = replace(
    html_table,
    r" style *= *\".*\"" => "",
    "<tr class = \"header headerLastRow\">" => "<tr>")
html_table =
    "export function Table() {\n\treturn (\n\t" *
    html_table[1:6] *
    " class=\"llmr-numbers\"" *
    html_table[7:end] *
    "\n)}"
open("Table.tsx", "w") do io
    println(io, html_table)
end
# save("table.html", html_table)
