
def main [model: string] {
    (open $"unparsed-($model)"
        | from json
        | get response
        | each {
            lines
            | last
            | str replace "<|im_end|>" ""
            | str trim
            | str trim --char "."
            | str trim --char "*"
            | tee { print }
            | parse --regex '.* \**(?P<answer>\d+)$'
            | try { get answer.0 | into int } catch { -918273645 }
        }
        | to json
        | save -f $model
    )
}
