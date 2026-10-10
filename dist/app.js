/* Contatos da professora. */
const CONTACTS = {
  whatsapp: "https://wa.me/5519953273391",
  instagram: "https://www.instagram.com/miingrrr/",
  email: "professora@exemplo.com"
};

const toast = document.querySelector("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, 3200);
}

// Permite somente endereços HTTPS dos serviços configurados.
function getSafeContactUrl(type, value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  if (type === "email") {
    const email = value.trim().replace(/^mailto:/i, "");
    const emailValido = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (!emailValido.test(email)) {
      return null;
    }

    return `mailto:${email}`;
  }

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "https:") {
      return null;
    }

    const hostsPermitidos = {
      whatsapp: ["wa.me", "api.whatsapp.com", "web.whatsapp.com"],
      instagram: ["instagram.com", "www.instagram.com"]
    };

    const hostsDoTipo = hostsPermitidos[type] || [];

    if (!hostsDoTipo.includes(url.hostname.toLowerCase())) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

const accountDialog = document.querySelector("#account-dialog");

document
  .querySelectorAll('[data-action="student-area"]')
  .forEach((button) => {
    button.addEventListener("click", () => accountDialog.showModal());
  });

document
  .querySelectorAll(".dialog-close, .dialog-ok")
  .forEach((button) => {
    button.addEventListener("click", () => accountDialog.close());
  });

document.querySelectorAll("[data-contact]").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.contact;
    const value = CONTACTS[type];

    if (value) {
      const safeUrl = getSafeContactUrl(type, value);

      if (!safeUrl) {
        showToast("Esse contato não tem um endereço válido configurado.");
        return;
      }

      if (type === "email") {
        window.location.assign(safeUrl);
      } else {
        window.open(safeUrl, "_blank", "noopener,noreferrer");
      }

      return;
    }

    const names = {
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      email: "e-mail"
    };

    showToast(`O contato de ${names[type] || "contato"} será adicionado aqui.`);
  });
});

const searchInput = document.querySelector("#course-search");
const courseCards = [...document.querySelectorAll(".course-card")];
const emptySearch = document.querySelector("#empty-search");

function filterCourses() {
  const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  let visible = 0;

  for (const card of courseCards) {
    const searchableText =
      (card.innerText + " " + (card.dataset.searchable || ""))
        .toLocaleLowerCase("pt-BR");

    const matches = !query || searchableText.includes(query);
    card.hidden = !matches;

    if (matches) {
      visible += 1;
    }
  }

  emptySearch.hidden = visible !== 0;
}

searchInput.addEventListener("input", filterCourses);

document
  .querySelector("#search-form")
  .addEventListener("submit", (event) => event.preventDefault());

document.addEventListener("keydown", (event) => {
  const activeTag = document.activeElement.tagName;

  if (
    event.key === "/" &&
    !["INPUT", "TEXTAREA"].includes(activeTag)
  ) {
    event.preventDefault();
    searchInput.focus();
  }

  if (event.key === "Escape" && accountDialog.open) {
    accountDialog.close();
  }
});

const chatLauncher = document.querySelector("#chat-launcher");
const chatPanel = document.querySelector("#chat-panel");
const chatMessages = document.querySelector("#chat-messages");

function setChat(open) {
  chatPanel.hidden = !open;
  chatLauncher.setAttribute("aria-expanded", String(open));

  if (open) {
    document.querySelector("#chat-close").focus();
  } else {
    chatLauncher.focus();
  }
}

chatLauncher.addEventListener("click", () => {
  setChat(chatPanel.hidden);
});

document
  .querySelector("#chat-close")
  .addEventListener("click", () => setChat(false));

document.querySelectorAll("[data-chat-open]").forEach((button) => {
  button.addEventListener("click", () => setChat(true));
});

const answers = {
  aulas:
    "Temos trilhas sobre C, C#, C++, Python, JavaScript, TypeScript, Linux e Kali Linux. Escolha uma aula na seção “Aulas” para conhecer os temas.",
  materiais:
    "A área de PDFs está sendo preparada. Quando os materiais e a forma de pagamento estiverem definidos, as informações aparecerão na seção “Loja e PDFs”.",
  contato:
    "Você pode falar com a professora pelo WhatsApp, Instagram ou e-mail nos botões da seção “Meu contato”. Escolha o canal que preferir. 🌷"
};

const questions = {
  aulas: "Quais são as aulas?",
  materiais: "Como funcionam os PDFs?",
  contato: "Quero entrar em contato"
};

document.querySelectorAll("[data-question]").forEach((button) => {
  button.addEventListener("click", () => {
    const question = button.dataset.question;
    const userText = questions[question];
    const replyText = answers[question];

    if (!userText || !replyText) {
      return;
    }

    const userMessage = document.createElement("p");
    userMessage.className = "user-message";
    userMessage.textContent = userText;

    const reply = document.createElement("p");
    reply.className = "bot-message";
    reply.textContent = replyText;

    chatMessages.append(userMessage, reply);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
});

const menuButton = document.querySelector(".mobile-menu-button");
const sidebar = document.querySelector(".sidebar");

menuButton.addEventListener("click", () => {
  const open = sidebar.classList.toggle("menu-open");

  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Fechar menu" : "Abrir menu"
  );
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => {
      item.classList.remove("active");
    });

    link.classList.add("active");
    sidebar.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
  });
});