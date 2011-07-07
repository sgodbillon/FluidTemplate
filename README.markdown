# Description
This JavaScript template engine is designed to provide a fluid yet powerful syntax.

# Features
* Light and expressive syntax
* Autoescaping (may be disabled locally with the `raw()` function)
* Handles arrays

# How to use it

Example:

    <script type="text/html" id="myTemplate">
        <li>
            Favorite bands of $(_.sex === "M" ? "Mr." : "Mrs.") $(_.name) : $if(_.bands) { ($(_.bands.length)) }
            $if(_.bands) {
                <ul>
                $for(var i in _.bands) {
                    <li>$(_.bands[i])</li>
                }
                </ul>
            } else {
                (Unknown)
            }
        </li>
    </script>
    <script type="text/javascript">
        var template = FluidTmpl.compile("myTemplate")
        document.getElementById("destination").innerHTML = template([
            {
                name: "Joe",
                sex: "M",
                bands: [
                    "Gojira",
                    "Metallica"
                ]
            },
            {
                name: "Alice",
                sex: "F",
                bands: [
                    "The Dandy Warhols",
                    "Rodrigo & Gabriela"
                ]
            },
            {
                name: "Vince",
                sex: "M"
            }
        ]);
        // Then you can reuse it with:
        // FluidTmpl.run("myTemplate", myData)
    </script>