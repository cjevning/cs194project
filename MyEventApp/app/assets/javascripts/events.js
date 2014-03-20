var fofVisible = false;

function toggleFOFVisibility() {
	console.log("toggle");
	fofDiv = document.getElementById("fof_form_item");
	if (!fofVisible) {
		fofVisible = true;
		fofDiv.style.display = "block";
	} else {
		fofVisible = false;
		fofDiv.style.display = "none";
	}
}