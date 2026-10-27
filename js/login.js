//  CADASTRO  //

const loginUrl = new URL(window.location.href);
if (loginUrl.searchParams.has("authError")) {
  fetch("/auth/erro", { credentials: "same-origin" })
    .then((response) => response.json())
    .then((data) => alert(data.error || "Não foi possível entrar com essa conta."))
    .catch(() => alert("Não foi possível entrar com essa conta."))
    .finally(() => {
      loginUrl.searchParams.delete("authError");
      window.history.replaceState({}, "", loginUrl);
    });
}

document
  .getElementById("form_Cadastro")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    var nome = document.getElementById("name_C").value;
    var inmail = document.getElementById("email_C").value;
    var senha = document.getElementById("password_C").value;
    var senha2 = document.getElementById("password2_C").value;

    if (senha != senha2) {
      alert("As senhas não conferem");
      document.getElementById("password").value = "";
      document.getElementById("password2").value = "";
      return;
    }

    fetch("/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: nome,
        email: inmail,
        password: senha,
      }),
    })
      .then((response) => response.json())
      .then((dados) => {
        if (dados.hasOwnProperty("error")) {
          alert(dados.error);
          return;
        }
        document.getElementById("name_C").value = "";
        document.getElementById("email_C").value = "";
        document.getElementById("password_C").value = "";
        document.getElementById("password2_C").value = "";
        document.getElementById("termos").checked = false;
        alert(dados.message);
        switchTab("entrar", document.querySelector(".tab-btn"));
      })
      .catch(() => alert("Não foi possível concluir o cadastro. Tente novamente."));
  });

//  LOGIN  //

document
  .getElementById("form_Login")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    var inmail = document.getElementById("email_L").value.trim();
    var senha = document.getElementById("password_L").value;

    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: inmail,
        password: senha,
      }),
    })
      .then(async (response) => {
        const dados = await response.json();
        if (dados.hasOwnProperty("error")) {
          alert(dados.error);
          return false;
        }

        document.getElementById("email_L").value = "";
        document.getElementById("password_L").value = "";
        const account = dados.usuario?.name
          ? dados.usuario
          : { name: inmail.split("@")[0], email: inmail };
        localStorage.setItem("vidaTerrestreUsuario", JSON.stringify(account));
        window.location.href = "conta.html";
        return true;
      })
      .catch(() => alert("Não foi possível entrar. Verifique sua conexão e tente novamente."));
  });
