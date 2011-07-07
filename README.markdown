# Description
This JavaScript template engine is designed to provide a fluid yet powerful syntax.

# Features
* Light and expressive syntax
* Autoescaping (may be disabled locally with the `raw()` function)
* Handles arrays
* Template composition

# How to use it

Example:
    <script type="text/html" id="band">
        <li>
            <dl>
                <dt>$(_.name)</dt>
                <dl>$(_.genre)</dl>
            </dl>
        </li>
    </script>
    <script type="text/html" id="myTemplate">
        <li>
            Favorite bands of $(_.sex === "M" ? "Mr." : "Mrs.") $(_.name) : $if(_.bands) { ($(_.bands.length)) }
            $if(_.bands) {
                <ul>
                    $(run("band", _.bands))
                </ul>
            } else {
                (Unknown)
            }
        </li>
    </script>
    <script type="text/javascript">
        // compile band to make it available in myTemplate
        FluidTmpl.compile("band")
        var template = FluidTmpl.compile("myTemplate")
        document.getElementById("destination").innerHTML = template([
            {
                name: "Joe",
                sex: "M",
                bands: [
                    {
                        name: "Gojira",
                        genre: "Death Metal"
                    },
                    {
                        name: "Metallica",
                        genre: "Thrash Metal"
                    }
                ]
            },
            {
                name: "Alice",
                sex: "F",
                bands: [
                    {
                        name: "The Dandy Warhols",
                        genre: "Rock"
                    },
                    {
                        name: "Rodrigo & Gabriela",
                        genre: "Folk"
                    }
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