# You need to start the llama.cpp server before running this
# I recommend the parameter -np 24 to process the queries in parallel.
# Adjust context size accordingly. I found each query used less than 256 tokens.

def chat-complete [messages] {
    (curl -s http://127.0.0.1:8080/chat/completions
          -H "Content-Type: application/json"
          -d $'{
                   "messages": [
                   { "role": "system", "content": "($messages.system)"},
                   { "role": "user", "content": "($messages.user)" }
                   ],
                   "temperature": 0
               }')
        | from json
        | get choices.0.message.content
        # | tee { each { print } } | get 0
}

def main [queries: int, model: string] {
    (generate
        {i: 0, res: "1"}
        {|acc| if $acc.i < $queries { {out: $acc.res, next: {i: ($acc.i + 1), res: ([$acc.res, "+1"] | str join)} } } }
        | enumerate
        | par-each {
            let messages = {
                system: "You are a calculator that evaluates math expressions. Write each step of the solution and finally write the answer as an integer like so: Answer: <integer>",
                user: $"($in.item) = ",
                index: $in.index
                };
            { index: $messages.index, response: (chat-complete $messages) }
            }
        | sort-by index
        | to json
        | save -f $"unparsed-($model)"
    )
}
