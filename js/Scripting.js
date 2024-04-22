switchedText = false

function AlertMessage()
{
    alert("I am an alert box!")
}

function ReplaceText()
{
    if (switchedText == false)
    {
        document.getElementById("ReplacedText").innerHTML = "ReplacedText"
        switchedText = true
    }    
    else 
    {
        document.getElementById("ReplacedText").innerHTML = "Unreplaced Text"
        switchedText = false
    }
}