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
        | tee { each { print } }
        | get 0
}

def test-complete [messages] {
    print $messages;
    $"($messages.y + $messages.x)"
}

def main [queries: int, model: string] {
    1..$queries
        | each { |y| 1..$queries | each { |x|  $"($y)-($x)=" } }
        | par-each { |row|
            $row | each { |input|
                let messages = {
                    system: "Only respond with a single number.",
                    user: $input,
                    };
                (chat-complete $messages | try { into int } catch { NaN })
            }
        }
        | tee { print }
        | sort-by x
        | sort-by y
        | to json
        | save -f $model
}
