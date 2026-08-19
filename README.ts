  @{
      <partial name="_ValidationScriptsPartial" />
  }

  <script>

      const myDivContainer = document.getElementById("abc");
      document.addEventListener('click', function(e) {
          if(e.target.classList.contains("add-row")) {
              const row = e.target.closest(".template-row");
              const clone = row.cloneNode(true);

              clone.querySelectorAll("input","select").forEach(el => el.value = "");

              myDivContainer.appendChild(clone);
          }
      });
