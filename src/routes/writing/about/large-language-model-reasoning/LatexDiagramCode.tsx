export default function LatexDiagramCode() {
    return (
        <>
            <p>
                Certainly! Here's the adjusted code with the renamed hidden
                layer nodes, an additional fourth hidden layer (<code>L_4</code>
                ), an additional node in each layer, and a space with vertical
                ellipsis between the last hidden layer and the Output Tokens
                layer:
            </p>
            <pre>
                {`\\documentclass{article}
\\usepackage{tikz}
\\usetikzlibrary{positioning, arrows.meta, fit, backgrounds}

\\begin{document}
\\begin{tikzpicture}[node distance=1cm and 1cm, &gt;=Stealth, thick,
every node/.style={draw, minimum width=1.5cm, minimum height=1cm, align=center, rounded corners=5pt},
input/.style={fill = green!20},
output/.style={fill = red!20},
hidden/.style={fill = gray!20},
attention/.style={-& gt;, draw=black!70, thick, densely dashed},
recurrence/.style={-& gt;, draw=blue!70, thick, rounded corners},
coordinate/.style={coordinate}]

% Nodes for input layer
\\begin{scope}[local bounding box=input box]
\\node[input] (x1) {\\tt{& lt;start&gt;}};
\\node[input, right=of x1] (x2) {\\tt{lorem}};
\\node[input, right=of x2] (x3) {\\tt{ipsum}};
\\node[input, right=of x3] (x4) {\\tt{dolor}};
\\end{scope}
\\node[fit=(input box), draw, label=left:Input Tokens, inner sep=10pt] {};

% Nodes for hidden layer L1
\\begin{scope}[local bounding box=l1 box]
\\node[hidden, above=of x1] (l1h1) {$L_{1}p_1$};
\\node[hidden, right=of l1h1] (l1h2) {$L_{1}p_2$};
\\node[hidden, right=of l1h2] (l1h3) {$L_{1}p_3$};
\\node[hidden, right=of l1h3] (l1h4) {$L_{1}p_4$};
\\end{scope}
\\node[fit=(l1 box), draw, label=left:$L_1$, inner sep=10pt] {};

% Nodes for hidden layer L2
\\begin{scope}[local bounding box=l2 box]
\\node[hidden, above=of l1h1] (l2h1) {$L_{2}p_1$};
\\node[hidden, right=of l2h1] (l2h2) {$L_{2}p_2$};
\\node[hidden, right=of l2h2] (l2h3) {$L_{2}p_3$};
\\node[hidden, right=of l2h3] (l2h4) {$L_{2}p_4$};
\\end{scope}
\\node[fit=(l2 box), draw, label=left:$L_2$, inner sep=10pt] {};

% Nodes for hidden layer L3
\\begin{scope}[local bounding box=l3 box]
\\node[hidden, above=of l2h1] (l3h1) {$L_{3}p_1$};
\\node[hidden, right=of l3h1] (l3h2) {$L_{3}p_2$};
\\node[hidden, right=of l3h2] (l3h3) {$L_{3}p_3$};
\\node[hidden, right=of l3h3] (l3h4) {$L_{3}p_4$};
\\end{scope}
\\node[fit=(l3 box), draw, label=left:$L_3$, inner sep=10pt] {};

% Nodes for hidden layer L4
\\begin{scope}[local bounding box=l4 box]
\\node[hidden, above=of l3h1] (l4h1) {$L_{4}p_1$};
\\node[hidden, right=of l4h1] (l4h2) {$L_{4}p_2$};
\\node[hidden, right=of l4h2] (l4h3) {$L_{4}p_3$};
\\node[hidden, right=of l4h3] (l4h4) {$L_{4}p_4$};
\\end{scope}
\\node[fit=(l4 box), draw, label=left:$L_4$, inner sep=10pt] {};

% Ellipsis node
\\node[above=of l4h2, align=center] (ellipsis) {\\vdots};

% Nodes for output layer
\\begin{scope}[local bounding box=output box]
\\node[output, above=of ellipsis] (y1) {\\tt{lorem}};
\\node[output, right=of y1] (y2) {\\tt{ipsum}};
\\node[output, right=of y2] (y3) {\\tt{dolor}};
\\node[output, right=of y3] (y4) {\\tt{sit}};
\\end{scope}
\\node[fit=(output box), draw, label=left:Output Tokens, inner sep=10pt] {};

% input tokens to L1
\\draw[-&gt;] (x1) -- (l1h1);
\\draw[-&gt;] (x2) -- (l1h2);
\\draw[-&gt;] (x3) -- (l1h3);
\\draw[-&gt;] (x4) -- (l1h4);

% attention connections from L1 to L2
\\draw[attention] (l1h1) -- (l2h1);
\\draw[attention] (l1h1) -- (l2h2);
\\draw[attention] (l1h1) -- (l2h3);
\\draw[attention] (l1h1) -- (l2h4);
\\draw[attention] (l1h2) -- (l2h2);
\\draw[attention] (l1h2) -- (l2h3);
\\draw[attention] (l1h2) -- (l2h4);
\\draw[attention] (l1h3) -- (l2h3);
\\draw[attention] (l1h3) -- (l2h4);
\\draw[attention] (l1h4) -- (l2h4);

% attention connections from L2 to L3
\\draw[attention] (l2h1) -- (l3h1);
\\draw[attention] (l2h1) -- (l3h2);
\\draw[attention] (l2h1) -- (l3h3);
\\draw[attention] (l2h1) -- (l3h4);
\\draw[attention] (l2h2) -- (l3h2);
\\draw[attention] (l2h2) -- (l3h3);
\\draw[attention] (l2h2) -- (l3h4);
\\draw[attention] (l2h3) -- (l3h3);
\\draw[attention] (l2h3) -- (l3h4);
\\draw[attention] (l2h4) -- (l3h4);

% attention connections from L3 to L4
\\draw[attention] (l3h1) -- (l4h1);
\\draw[attention] (l3h1) -- (l4h2);
\\draw[attention] (l3h1) -- (l4h3);
\\draw[attention] (l3h1) -- (l4h4);
\\draw[attention] (l3h2) -- (l4h2);
\\draw[attention] (l3h2) -- (l4h3);
\\draw[attention] (l3h2) -- (l4h4);
\\draw[attention] (l3h3) -- (l4h3);
\\draw[attention] (l3h3) -- (l4h4);
\\draw[attention] (l3h4) -- (l4h4);

% final hidden layer to output tokens
\\draw[-&gt;] (l4h1) -- (y1);
\\draw[-&gt;] (l4h2) -- (y2);
\\draw[-&gt;] (l4h3) -- (y3);
\\draw[-&gt;] (l4h4) -- (y4);

% autoregressive recurrence

% Draw the recurrence connections with waypoints
\\node[coordinate, above right=0.75cm and 0.5cm of y1] (p1o) {};
\\node[coordinate, below right=0.75cm and 0.5cm of x1] (p1i) {};
\\draw[recurrence] (y1.north) |- (p1o) -- (p1i) -| (x2.south);

\\node[coordinate, above right=0.75cm and 0.5cm of y2] (p2o) {};
\\node[coordinate, below right=0.75cm and 0.5cm of x2] (p2i) {};
\\draw[recurrence] (y2.north) |- (p2o) -- (p2i) -| (x3.south);

\\node[coordinate, above right=0.75cm and 0.5cm of y3] (p3o) {};
\\node[coordinate, below right=0.75cm and 0.5cm of x3] (p3i) {};
\\draw[recurrence] (y3.north) |- (p3o) -- (p3i) -| (x4.south);

\\end{tikzpicture}
\\end{document}
  `}
            </pre>
            <h3>Key Adjustments:</h3>
            <ol>
                <li>
                    <strong>Renamed Hidden Layer Nodes</strong>: Updated the
                    labels for the hidden layer nodes to use <code>L_mp_n</code>
                    .
                </li>
                <li>
                    <strong>
                        Added Fourth Hidden Layer (<code>L_4</code>)
                    </strong>
                    : Added nodes for the fourth hidden layer and updated
                    connections.
                </li>
                <li>
                    <strong>Added an Extra Node to Each Layer</strong>:
                    Increased the number of nodes per layer to four.
                </li>
                <li>
                    <strong>Added Vertical Ellipsis</strong>: Inserted a{" "}
                    <code>\vdots</code> node between the last hidden layer and
                    the Output Tokens layer.
                </li>
            </ol>
            <p>
                These adjustments ensure the diagram includes all the requested
                changes.
            </p>
        </>
    );
}
