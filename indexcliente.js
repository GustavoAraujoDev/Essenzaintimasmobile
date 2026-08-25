// ============================================================
// CONFIGURAÇÕES GERAIS
// ============================================================

const API_URL = "https://essenzaintimasapi.onrender.com/products";

let isLogin = true;
let cart = JSON.parse(
  localStorage.getItem("cart") || "[]"
);
let currentProduct = null;
let currentSelectedSku = null;
let taxaEntregaAtual = 0;
let debounceTimer = null;


// ============================================================
// LOCALIZAÇÃO DA LOJA
// ============================================================

const MINHA_LOJA_COORD = {
    lat: -3.702528,
    lng: -38.589886
};


// ============================================================
// ÁUDIO
// ============================================================

const audioAlerta = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
);


// ============================================================
// SWEETALERT2
// ============================================================

const Toast = Swal.mixin({

    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 4000

});




// ============================================================
// PRODUTOS LOCAIS — FALLBACK
// ============================================================

const PRODUCTS_DATA = [

    {
        id: "prod-1",
        name: "Sutiã Bralette Rendado Élora",
        description:
            "Confeccionado em renda francesa de toque aveludado, sem aro, com sustentação macia e detalhes refinados.",
        status: "ACTIVE",
        categoryId: "Lingeries",

        images: [
            "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?q=80&w=800&auto=format&fit=crop"
        ],

        skus: [
            {
                id: "sku-1-p",
                size: "P",
                color: "Nude",
                price: 189.90,
                stock: 5
            },
            {
                id: "sku-1-m",
                size: "M",
                price: 189.90,
                stock: 3
            }
        ]
    },


    {
        id: "prod-2",
        name: "Body Em Renda & Tule Silk",
        description:
            "Modelagem anatômica que abraça o corpo com transparência sutil, decote em V e fecho inferior reforçado.",
        status: "ACTIVE",
        categoryId: "Lingeries",

        images: [
            "https://images.unsplash.com/photo-1596475604172-888497645172?q=80&w=800&auto=format&fit=crop"
        ],

        skus: [
            {
                id: "sku-2-m",
                size: "M",
                price: 249.00,
                stock: 4
            }
        ]
    },


    {
        id: "prod-3",
        name: "Robe de Seda Satin Nude",
        description:
            "Caimento fluido e elegante com faixa para amarração na cintura, mangas amplas e acabamento acetinado.",
        status: "ACTIVE",
        categoryId: "Essenciais",

        images: [
            "https://images.unsplash.com/photo-1516575334481-f85287c2c82d?q=80&w=800&auto=format&fit=crop"
        ],

        skus: [
            {
                id: "sku-3-unico",
                size: "Único",
                price: 310.00,
                stock: 6
            }
        ]
    },


    {
        id: "prod-4",
        name: "Conjunto Corset Velvet Rose",
        description:
            "Corset estruturado com barbatanas flexíveis e calcinha fio dental em microfibra aveludada.",
        status: "ACTIVE",
        categoryId: "Coleções",

        images: [
            "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?q=80&w=800&auto=format&fit=crop"
        ],

        skus: [
            {
                id: "sku-4-p",
                size: "P",
                price: 279.90,
                stock: 2
            }
        ]
    }

];


// ============================================================
// CARREGAR PRODUTOS
// ============================================================

async function carregarProdutos() {

    console.log("🌐 Iniciando carregamento...");

    try {

        console.log(
            "🌐 Buscando produtos na API:",
            API_URL
        );


        // ====================================================
        // API
        // ====================================================

        const response = await fetch(
            API_URL,
            {
                method: "GET",

                headers: {
                    "Accept": "application/json"
                },

                credentials: "include"
            }
        );


        console.log(
            "📡 Status:",
            response.status
        );


        // ====================================================
        // ERRO HTTP
        // ====================================================

        if (!response.ok) {

            throw new Error(
                `API respondeu HTTP ${response.status}`
            );

        }


        // ====================================================
        // JSON
        // ====================================================

        const data =
            await response.json();


        console.log(
            "📦 Dados recebidos da API:",
            data
        );


        // ====================================================
        // IDENTIFICAR ARRAY
        // ====================================================

        let products = data;


        // Caso API retorne:
        // { products: [...] }

        if (
            !Array.isArray(products) &&
            Array.isArray(data.products)
        ) {

            products =
                data.products;

        }


        // ====================================================
        // VALIDAR
        // ====================================================

        if (!Array.isArray(products)) {

            throw new Error(
                "A API não retornou um array de produtos."
            );

        }


        // ====================================================
        // API FUNCIONOU
        // ====================================================

        console.log(
            `✅ API funcionando: ${products.length} produtos.`
        );


        renderProducts(
            products
        );


        console.log(
            "🟢 Produtos da API renderizados."
        );


    } catch (error) {

        // ====================================================
        // API FALHOU
        // ====================================================

        console.error(
            "❌ API indisponível:",
            error
        );


        console.warn(
            "🟡 Usando PRODUCTS_DATA como fallback."
        );


        // ====================================================
        // FALLBACK
        // ====================================================

        if (
            Array.isArray(PRODUCTS_DATA) &&
            PRODUCTS_DATA.length > 0
        ) {

            console.log(
                `📦 Carregando ${PRODUCTS_DATA.length} produtos locais.`
            );


            renderProducts(
                PRODUCTS_DATA
            );


            // ------------------------------------------------
            // AVISO DISCRETO
            // ------------------------------------------------

            if (
                typeof Toast !== "undefined"
            ) {

                Toast.fire({
                    icon: "warning",
                    title: "Produtos carregados em modo offline"
                });

            }


        } else {

            // =================================================
            // NEM API NEM PRODUTOS LOCAIS
            // =================================================

            const container =
                document.getElementById(
                    "categories-container"
                );


            if (container) {

                container.innerHTML = `

                    <div class="text-center py-16 px-4">

                        <p class="
                            font-serif-luxury
                            text-xl
                            text-[#26211E]/70
                        ">

                            Não foi possível carregar os produtos.

                        </p>

                        <p class="
                            text-xs
                            text-[#8C7A6B]
                            mt-2
                        ">

                            Tente novamente mais tarde.

                        </p>

                        <button

                            type="button"

                            onclick="carregarProdutos()"

                            class="
                                mt-5
                                px-5
                                py-2.5
                                rounded-full
                                bg-[#26211E]
                                text-white
                                text-xs
                                font-semibold
                            "

                        >

                            Tentar novamente

                        </button>

                    </div>

                `;

            }

        }

    }

}


// ============================================================
// DOM CARREGADO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "🟢 DOM carregado."
        );


        // ====================================================
        // CONTAINER
        // ====================================================

        const container =
            document.getElementById(
                "categories-container"
            );


        if (!container) {

            console.error(
                "❌ categories-container não encontrado."
            );

            return;

        }


        // ====================================================
        // NAV
        // ====================================================

        const nav =
            document.getElementById(
                "categories-nav"
            );


        if (!nav) {

            console.warn(
                "⚠️ categories-nav não encontrado."
            );

        }


        // ====================================================
        // CARREGAR
        // ====================================================

        await carregarProdutos();

    }
);

function controlarPiscaPisca(inputElement) {
  // Se o usuário digitou algo no campo atual
  if (inputElement.value.trim() !== "") {
    inputElement.classList.remove("piscar-alerta-direto");
    inputElement.classList.add("bg-white", "border-gray-300"); // Estilo limpo enquanto digita
  } else {
    // Se ele apagar tudo, o campo volta a piscar imediatamente
    inputElement.classList.remove("bg-white", "border-gray-300");
    inputElement.classList.add("piscar-alerta-direto");
  }
}




function getStoreFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("loja") || "EssenzaIntimas";
}

const storeTag = getStoreFromUrl();

const companyBadge =
    document.getElementById("company-badge");

const storeNameText =
    document.getElementById("store-name-text");

if (companyBadge) {
    companyBadge.innerText = `Loja: ${storeTag}`;
}

if (storeNameText) {
    storeNameText.innerText = storeTag;
}



// Toggle Login/Cadastro
const toggleBtn = document.getElementById("toggle-auth");
toggleBtn.addEventListener("click", () => {
  isLogin = !isLogin;
  document.getElementById("group-name").classList.toggle("hidden");
  document.getElementById("group-phone").classList.toggle("hidden");
  document.getElementById("auth-title").querySelector("h2").innerText = isLogin
    ? "Falta pouco para matar sua fome!"
    : "Crie sua conta agora";
  document.getElementById("btn-submit").innerText = isLogin
    ? "Continuar"
    : "Cadastrar";
  document.getElementById("toggle-text").innerText = isLogin
    ? "Não possui conta?"
    : "Já tem conta?";
  toggleBtn.innerText = isLogin ? "Criar conta" : "Fazer login";
});



// Autenticação
document.getElementById("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const endpoint = isLogin ? "/auth/login" : "/auth/registrar";
  const payload = isLogin
    ? { email, password, context: { companyTag: storeTag } }
    : {
        email,
        password,
        role: "CUSTOMER",
        context: { companyTag: storeTag },
        customerData: {
          name: document.getElementById("name").value,
          phone: document.getElementById("phone").value,
        },
      };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Erro na autenticação");

    // Feedback visual de sucesso
    Toast.fire({
      icon: "success",
      title: isLogin ? "Bem-vindo de volta!" : "Conta criada com sucesso!",
    });

    showMenu();
  } catch (err) {
    // Usando seu Swal configurado anteriormente para erros
    Swal.fire({
      icon: "error",
      title: "Falha na Autenticação",
      text: err.message,
    });
  }
});



// ============================================================
// ABAS
// ============================================================

function switchTab(tab) {

  // ============================================================
  // TODAS AS ÁREAS QUE PODEM FICAR VISÍVEIS
  // ============================================================

  const sections = [
    // Navegação principal
    "menu-section",
    "cart-section",
    "details-section",
    "auth-section",
    "orders-section",

    // Seções da Home
    "benefits-section",
    "why-essenza-section",
    "reviews-section",
    "instagram-section",
    "faq-section",

    // Guia de tamanhos
    "tabela-tamanhos"
  ];


  // ============================================================
  // ESCONDE TODAS AS SEÇÕES
  // ============================================================

  sections.forEach((sectionId) => {

    const element = document.getElementById(sectionId);

    if (element) {
      element.classList.add("hidden");
    }

  });


  // ============================================================
  // HOME / MENU
  // ============================================================

  if (tab === "menu") {

    const homeSections = [
      "menu-section",
      "benefits-section",
      "why-essenza-section",
      "reviews-section",
      "instagram-section",
      "faq-section"
    ];

    homeSections.forEach((sectionId) => {

      document
        .getElementById(sectionId)
        ?.classList.remove("hidden");

    });

  }


  // ============================================================
  // CARRINHO
  // ============================================================

  else if (tab === "cart") {

    document
      .getElementById("cart-section")
      ?.classList.remove("hidden");

    if (typeof renderCart === "function") {
      renderCart();
    }

  }


  // ============================================================
  // DETALHES DO PRODUTO
  // ============================================================

  else if (tab === "details") {

    document
      .getElementById("details-section")
      ?.classList.remove("hidden");

  }


  // ============================================================
  // LOGIN / AUTENTICAÇÃO
  // ============================================================

  else if (tab === "auth") {

    document
      .getElementById("auth-section")
      ?.classList.remove("hidden");

  }


  // ============================================================
  // PEDIDOS
  // ============================================================

  else if (tab === "orders") {

    document
      .getElementById("orders-section")
      ?.classList.remove("hidden");

    /*
    if (currentUser?.profile?.phone) {

      const searchPhone =
        document.getElementById("search-phone");

      if (searchPhone) {
        searchPhone.value =
          currentUser.profile.phone;
      }

      if (typeof fetchOrdersByPhone === "function") {
        fetchOrdersByPhone();
      }
    }
    */

  }


  // ============================================================
  // TABELA DE TAMANHOS
  // ============================================================

  else if (tab === "sizes") {

    document
      .getElementById("tabela-tamanhos")
      ?.classList.remove("hidden");

  }


  // ============================================================
  // ABA INVÁLIDA
  // ============================================================

  else {

    console.warn(
      `⚠️ Aba "${tab}" não encontrada.`
    );

    // Volta para a Home
    document
      .getElementById("menu-section")
      ?.classList.remove("hidden");

  }


  // ============================================================
  // VOLTA PARA O TOPO
  // ============================================================

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });


  // ============================================================
  // SALVA A ABA ATUAL
  // ============================================================

  localStorage.setItem("lastTab", tab);
}



// ============================================================
// ABRIR CATÁLOGO
// ============================================================

// ============================================================
// ABRIR CATÁLOGO — DEBUG
// ============================================================

function showMenu() {

    // --------------------------------------------------------
    // Verifica PRODUCTS_DATA
    // --------------------------------------------------------

    

    if (typeof PRODUCTS_DATA === "undefined") {

        alert(
            "🔴 ERRO SHOWMENU\n\n" +
            "PRODUCTS_DATA NÃO EXISTE!"
        );

        return;
    }

    


    // --------------------------------------------------------
    // AUTH
    // --------------------------------------------------------

    const authSection =
        document.getElementById("auth-section");

    if (!authSection) {

        alert(
            "🟡 AVISO\n\n" +
            "auth-section não encontrado."
        );

    } else {

        

        authSection.classList.add("hidden");
    }


    // --------------------------------------------------------
    // MENU
    // --------------------------------------------------------

    const menuSection =
        document.getElementById("menu-section");

    if (!menuSection) {

        alert(
            "🔴 ERRO SHOWMENU\n\n" +
            "menu-section NÃO encontrado!"
        );

        return;
    }

    

    menuSection.classList.remove("hidden");


    // --------------------------------------------------------
    // BOTTOM NAV
    // --------------------------------------------------------

    const bottomNav =
        document.getElementById("bottom-nav");

    if (!bottomNav) {

      

    } else {

        

        bottomNav.classList.remove("hidden");
    }


    // --------------------------------------------------------
    // BODY
    // --------------------------------------------------------

    document.body.classList.add("pb-24");

    


    // --------------------------------------------------------
    // MAIN CONTENT
    // --------------------------------------------------------

    const mainContent =
        document.getElementById("main-content");

    if (!mainContent) {

        alert(
            "🟡 AVISO\n\n" +
            "main-content não encontrado."
        );

    } else {

        

        mainContent.classList.remove("max-w-md");
        mainContent.classList.add("max-w-4xl");
    }


    // --------------------------------------------------------
    // CONTAINER DOS PRODUTOS
    // --------------------------------------------------------

    const container =
        document.getElementById(
            "categories-container"
        );

    if (!container) {

        alert(
            "🔴 ERRO CRÍTICO\n\n" +
            "categories-container NÃO EXISTE!\n\n" +
            "É aqui que os produtos deveriam aparecer."
        );

        return;
    }

    


    // --------------------------------------------------------
    // RENDER PRODUCTS
    // --------------------------------------------------------

    if (typeof renderProducts !== "function") {

        alert(
            "🔴 ERRO CRÍTICO\n\n" +
            "A função renderProducts() NÃO EXISTE!"
        );

        return;
    }

    


    // --------------------------------------------------------
    // TENTA RENDERIZAR
    // --------------------------------------------------------

    try {

        

        renderProducts(PRODUCTS_DATA);

        

    } catch (error) {

        alert(
            "🔴 ERRO DENTRO DE renderProducts()\n\n" +
            "Mensagem:\n" +
            error.message
        );

        console.error(
            "ERRO COMPLETO:",
            error
        );

        return;
    }


    // --------------------------------------------------------
    // VERIFICA SE HTML FOI GERADO
    // --------------------------------------------------------


    if (
        container.innerHTML.trim() === ""
    ) {

        alert(
            "🔴 ERRO FINAL\n\n" +
            "renderProducts() executou,\n" +
            "mas NÃO colocou HTML no container."
        );

        return;
    }

};




// ============================================================
// RENDERIZA PRODUTOS
// ============================================================

function renderProducts(products) {

  const container =
    document.getElementById("categories-container");

  const navContainer =
    document.getElementById("categories-nav");

  // Verifica se os containers existem
  if (!container || !navContainer) {

    console.error(
      "Erro: categories-container ou categories-nav não encontrado."
    );

    return;
  }

  // Garante array
  if (!Array.isArray(products)) {

    console.error(
      "Erro: PRODUCTS_DATA não é um array."
    );

    return;
  }

  // ========================================================
  // FILTRO DE PRODUTOS
  // ========================================================

  const filteredProducts = products.filter((product) => {

    const isActive =
      product &&
      product.status === "ACTIVE";

    const hasStock =
      Array.isArray(product.skus) &&
      product.skus.some(
        (sku) =>
          Number(sku.stock) > 0
      );

    return isActive && hasStock;

  });


  // ========================================================
  // STATUS VISUAL
  // ========================================================

  if (
    typeof updateStoreVisualStatus ===
    "function"
  ) {

    updateStoreVisualStatus(
      filteredProducts.length === 0
    );

  }


  // ========================================================
  // NENHUM PRODUTO
  // ========================================================

  if (filteredProducts.length === 0) {

    container.innerHTML = `

      <div class="text-center py-16 px-4">

        <p class="font-serif-luxury text-xl text-[#26211E]/70 italic">
          Nenhuma peça disponível no momento.
        </p>

        <p class="text-xs text-[#8C7A6B] mt-1">
          Nossa equipe está atualizando a coleção.
          Volte em breve!
        </p>

      </div>

    `;

    navContainer.innerHTML = "";

    return;
  }


  // ========================================================
  // AGRUPAR POR CATEGORIA
  // ========================================================

  const groups =
    filteredProducts.reduce(
      (accumulator, product) => {

        const category =
          product.categoryId || "Geral";

        if (!accumulator[category]) {
          accumulator[category] = [];
        }

        accumulator[category].push(product);

        return accumulator;

      },
      {}
    );


  // Limpa conteúdo antigo
  container.innerHTML = "";
  navContainer.innerHTML = "";


  // ========================================================
  // RENDERIZAR CATEGORIAS
  // ========================================================

  Object.keys(groups).forEach(
    (categoryName, index) => {

      const categoryId =
        `cat-${categoryName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "-")}`;


      // ====================================================
      // BOTÃO DA CATEGORIA
      // ====================================================

      const activeClass =
        index === 0

          ? "bg-[#26211E] text-white border-[#26211E] shadow-sm"

          : "bg-white/80 text-[#8C7A6B] border-[#E8D8CF] hover:text-[#26211E] hover:border-[#9E7960]";


      navContainer.innerHTML += `

        <button

          type="button"

          onclick="scrollToCategory('${categoryId}', this)"

          class="
            category-btn
            px-5
            py-2.5
            rounded-full
            border
            text-xs
            font-semibold
            uppercase
            tracking-wider
            ${activeClass}
            transition-all
            shrink-0
            active:scale-95
          "

        >

          ${categoryName}

        </button>

      `;


      // ====================================================
      // PRODUTOS DA CATEGORIA
      // ====================================================

      const productsHTML =
        groups[categoryName]
          .map((product) => {

            // Primeiro SKU
            const primeiroSku =
              Array.isArray(product.skus) &&
              product.skus.length > 0

                ? product.skus[0]

                : null;


            // Preço
            const preco =
              primeiroSku
                ? Number(primeiroSku.price) || 0
                : 0;


            const precoFormatado =
              preco.toLocaleString(
                "pt-BR",
                {
                  style: "currency",
                  currency: "BRL"
                }
              );


            // Produto codificado
            const productEncoded =
              encodeURIComponent(
                JSON.stringify(product)
              );


            // Imagem
            const imageUrl =
              Array.isArray(product.images) &&
              product.images.length > 0

                ? product.images[0]

                : "";


            return `

              <div

                class="
                  group
                  bg-white
                  rounded-2xl
                  border
                  border-[#E8D8CF]/60
                  overflow-hidden
                  shadow-[0_4px_20px_rgba(38,33,30,0.03)]
                  hover:shadow-[0_10px_25px_rgba(158,121,96,0.12)]
                  hover:border-[#9E7960]/50
                  transition-all
                  duration-300
                  cursor-pointer
                  flex
                  flex-col
                  justify-between
                "

                onclick="openProductDetails(
                  JSON.parse(
                    decodeURIComponent('${productEncoded}')
                  )
                )"

              >

                <!-- IMAGEM -->

                <div
                  class="
                    relative
                    w-full
                    aspect-[3/4]
                    bg-[#FAF6F4]
                    overflow-hidden
                  "
                >

                  ${
                    imageUrl

                      ? `

                        <img

                          src="${imageUrl}"

                          alt="${product.name}"

                          class="
                            w-full
                            h-full
                            object-cover
                            object-center
                            group-hover:scale-105
                            transition-transform
                            duration-500
                          "

                          loading="lazy"

                          onerror="
                            this.style.display='none';
                            this.nextElementSibling.classList.remove('hidden');
                          "

                        />

                        <div
                          class="
                            hidden
                            absolute
                            inset-0
                            flex
                            flex-col
                            items-center
                            justify-center
                            text-[#8C7A6B]/50
                            p-4
                            text-center
                          "
                        >

                          <i class="fas fa-gem text-2xl mb-1"></i>

                          <span class="text-[10px] font-medium tracking-wider uppercase">
                            Imagem indisponível
                          </span>

                        </div>

                      `

                      : `

                        <div
                          class="
                            w-full
                            h-full
                            flex
                            flex-col
                            items-center
                            justify-center
                            text-[#8C7A6B]/50
                            p-4
                            text-center
                          "
                        >

                          <i class="fas fa-gem text-2xl mb-1"></i>

                          <span class="text-[10px] font-medium tracking-wider uppercase">
                            Sem imagem
                          </span>

                        </div>

                      `
                  }


                  <!-- ÍCONE -->

                  <div
                    class="
                      absolute
                      top-2.5
                      right-2.5
                      bg-white/80
                      backdrop-blur-md
                      rounded-full
                      p-1.5
                      shadow-sm
                      text-[#26211E]
                      opacity-0
                      group-hover:opacity-100
                      transition-opacity
                    "
                  >

                    <svg
                      class="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >

                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />

                    </svg>

                  </div>

                </div>


                <!-- DETALHES -->

                <div
                  class="
                    p-3.5
                    flex
                    flex-col
                    flex-1
                    justify-between
                    bg-white
                  "
                >

                  <div>

                    <h4
                      class="
                        font-medium
                        text-[#26211E]
                        text-xs
                        sm:text-sm
                        tracking-wide
                        line-clamp-1
                        group-hover:text-[#9E7960]
                        transition-colors
                      "
                    >

                      ${product.name}

                    </h4>


                    ${
                      product.description

                        ? `

                          <p
                            class="
                              text-[#8C7A6B]
                              text-[10px]
                              line-clamp-2
                              mt-1
                              leading-relaxed
                              font-light
                            "
                          >

                            ${product.description}

                          </p>

                        `

                        : ""
                    }

                  </div>


                  <!-- PREÇO -->

                  <div
                    class="
                      mt-3
                      pt-2
                      border-t
                      border-[#E8D8CF]/40
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <span
                      class="
                        font-semibold
                        text-[#26211E]
                        text-xs
                        sm:text-sm
                      "
                    >

                      ${precoFormatado}

                    </span>


                    <span
                      class="
                        text-[10px]
                        uppercase
                        tracking-wider
                        font-semibold
                        text-[#9E7960]
                      "
                    >

                      Ver

                      <i
                        class="
                          fas
                          fa-chevron-right
                          text-[8px]
                          ml-0.5
                        "
                      ></i>

                    </span>

                  </div>

                </div>

              </div>

            `;

          })
          .join("");


      // ====================================================
      // SEÇÃO DA CATEGORIA
      // ====================================================

      const sectionHtml = `

        <section
          id="${categoryId}"
          class="scroll-mt-24 mb-12"
        >

          <div
            class="
              flex
              items-center
              gap-3
              mb-6
            "
          >

            <h3
              class="
                font-serif-luxury
                text-xl
                sm:text-2xl
                font-normal
                text-[#26211E]
                italic
                tracking-wide
              "
            >

              ${categoryName}

            </h3>

            <div
              class="
                h-[1px]
                flex-1
                bg-gradient-to-r
                from-[#E8D8CF]
                to-transparent
              "
            ></div>

          </div>


          <div
            class="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              gap-3
              sm:gap-5
            "
          >

            ${productsHTML}

          </div>

        </section>

      `;


      container.innerHTML += sectionHtml;

    }
  );


  console.log(
    `✅ ${filteredProducts.length} produtos renderizados.`
  );

};



// ============================================================
// ROLAGEM PARA CATEGORIA
// ============================================================

function scrollToCategory(id, button) {

  const targetElement =
    document.getElementById(id);

  if (!targetElement) return;


  targetElement.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });


  const buttons =
    document.querySelectorAll(
      ".category-btn"
    );


  buttons.forEach((btn) => {

    btn.classList.remove(
      "bg-[#26211E]",
      "text-white",
      "border-[#26211E]"
    );

    btn.classList.add(
      "bg-white/80",
      "text-[#8C7A6B]",
      "border-[#E8D8CF]"
    );

  });


  if (button) {

    button.classList.remove(
      "bg-white/80",
      "text-[#8C7A6B]",
      "border-[#E8D8CF]"
    );

    button.classList.add(
      "bg-[#26211E]",
      "text-white",
      "border-[#26211E]"
    );

  }

}



// ============================================================
// STATUS DA LOJA
// ============================================================

function updateStoreVisualStatus(isClosed) {

  const badge =
    document.getElementById("status-badge");

  const ping =
    document.getElementById("status-ping");

  const dot =
    document.getElementById("status-dot");

  const text =
    document.getElementById("status-text");


  // IMPORTANTE:
  // Esses elementos não existem no HTML enviado.
  // Então não pode tentar acessar classList deles.

  if (!badge || !ping || !dot || !text) {

    console.log(
      "ℹ️ Elementos de status visual não encontrados. Continuando normalmente."
    );

    return;
  }


  if (isClosed) {

    ping.classList.add("hidden");

    dot.classList.remove(
      "bg-emerald-500"
    );

    dot.classList.add(
      "bg-gray-400"
    );

    text.innerText =
      "Fechado";

    text.classList.remove(
      "text-gray-700"
    );

    text.classList.add(
      "text-gray-400"
    );

    badge.classList.add(
      "opacity-80"
    );

  } else {

    ping.classList.remove(
      "hidden"
    );

    dot.classList.remove(
      "bg-gray-400"
    );

    dot.classList.add(
      "bg-emerald-500"
    );

    text.innerText =
      "Online";

    text.classList.remove(
      "text-gray-400"
    );

    text.classList.add(
      "text-gray-700"
    );

    badge.classList.remove(
      "opacity-80"
    );

  }

}



// ============================================================
// DETALHES DO PRODUTO
// ============================================================

function openProductDetails(product) {

  if (!product) {

    console.error(
      "Produto inválido."
    );

    return;
  }


  currentProduct = product;


  // Abre detalhes
  switchTab("details");


  window.scrollTo({
    top: 0,
    behavior: "instant"
  });


  const content =
    document.getElementById(
      "product-details-content"
    );


  if (!content) {

    console.error(
      "product-details-content não encontrado."
    );

    return;
  }


  // ========================================================
  // SKUS
  // ========================================================

  const skusHTML =
    (product.skus || [])
      .map((sku, index) => {

        const isOutOfStock =
          Number(sku.stock) <= 0;


        const skuDisplayName =
          sku.name ||
          `${sku.size || "Tamanho"}${
            sku.color
              ? " - " + sku.color
              : ""
          }`;


        return `

          <label
            class="
              flex-1
              ${
                isOutOfStock
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            "
          >

            <input

              type="radio"

              name="sku-opt"

              value="${Number(sku.price) || 0}"

              class="peer hidden"

              data-name="${skuDisplayName}"

              data-stock="${Number(sku.stock) || 0}"

              ${
                index === 0 &&
                !isOutOfStock
                  ? "checked"
                  : ""
              }

              ${
                isOutOfStock
                  ? "disabled"
                  : ""
              }

              onchange="
                if(typeof renderAttributes === 'function')
                  renderAttributes(${index});

                if(typeof updateTotal === 'function')
                  updateTotal();

                if(typeof resetMainQty === 'function')
                  resetMainQty();
              "

            />


            <div
              class="
                p-3
                border
                rounded-xl
                text-center
                peer-checked:border-rose-600
                peer-checked:bg-rose-50
                transition-all
              "
            >

              <span
                class="
                  block
                  font-bold
                  text-xs
                  uppercase
                "
              >

                ${skuDisplayName}

              </span>


              <span
                class="
                  block
                  text-xs
                  text-stone-500
                  font-normal
                "
              >

                R$
                ${Number(sku.price || 0).toFixed(2)}

              </span>


              ${
                isOutOfStock

                  ? `
                    <span
                      class="
                        text-[10px]
                        text-rose-500
                        font-bold
                      "
                    >
                      ESGOTADO
                    </span>
                  `

                  : ""
              }

            </div>

          </label>

        `;

      })
      .join("");


  // ========================================================
  // MODIFICADORES
  // ========================================================

  const modifiersHTML =
    (product.modifiers || [])
      .map((group, groupIndex) => {

        if (
          !group ||
          !Array.isArray(group.items)
        ) {
          return "";
        }


        const activeItems =
          group.items.filter(
            (item) =>
              item.status === "ACTIVE"
          );


        if (
          activeItems.length === 0
        ) {
          return "";
        }


        const min =
          Number(group.min) || 0;

        const max =
          Number(group.max) || 999;


        return `

          <div
            class="
              mt-6
              border-t
              pt-4
            "
          >

            <div
              class="
                flex
                justify-between
                items-center
                mb-3
              "
            >

              <h3
                class="
                  font-bold
                  text-xs
                  text-gray-500
                  uppercase
                "
              >

                ${groupIndex + 2}.
                ${group.name || "Opções"}

              </h3>


              <span
                class="
                  text-[10px]
                  bg-gray-100
                  px-2
                  py-1
                  rounded
                  text-gray-400
                "
              >

                Min: ${min}
                /
                Máx: ${max}

              </span>

            </div>


            <div class="space-y-2">

              ${activeItems
                .map((item) => {

                  const itemSafeId =
                    String(
                      item.name || "item"
                    )
                      .replace(
                        /\s+/g,
                        "-"
                      )
                      .replace(
                        /[^a-zA-Z0-9-_]/g,
                        ""
                      )
                      .toLowerCase();


                  return `

                    <div
                      class="
                        flex
                        justify-between
                        items-center
                        p-3
                        bg-gray-50
                        rounded-xl
                      "
                    >

                      <div>

                        <span
                          class="
                            text-sm
                            font-medium
                            text-gray-700
                          "
                        >

                          ${item.name}

                        </span>


                        ${
                          Number(item.price) > 0

                            ? `

                              <span
                                class="
                                  block
                                  text-[10px]
                                  text-gray-400
                                "
                              >

                                +
                                R$
                                ${Number(item.price).toFixed(2)}

                              </span>

                            `

                            : ""
                        }

                      </div>


                      <div
                        class="
                          flex
                          items-center
                          gap-3
                          bg-white
                          rounded-lg
                          border
                          p-1
                        "
                      >

                        <button
                          type="button"
                          onclick="
                            updateModifierQty(
                              '${groupIndex}',
                              '${itemSafeId}',
                              -1
                            )
                          "
                          class="
                            w-7
                            h-7
                            text-red-600
                            font-bold
                          "
                        >

                          -

                        </button>


                        <input

                          type="number"

                          id="mod-${groupIndex}-${itemSafeId}"

                          value="0"

                          data-price="${Number(item.price) || 0}"

                          data-name="${item.name}"

                          data-group="${group.name || ""}"

                          data-max="${max}"

                          class="
                            modifier-qty
                            w-6
                            text-center
                            text-sm
                            font-bold
                            border-none
                            bg-transparent
                          "

                          readonly

                        />


                        <button
                          type="button"
                          onclick="
                            updateModifierQty(
                              '${groupIndex}',
                              '${itemSafeId}',
                              1
                            )
                          "
                          class="
                            w-7
                            h-7
                            text-red-600
                            font-bold
                          "
                        >

                          +

                        </button>

                      </div>

                    </div>

                  `;

                })
                .join("")}

            </div>

          </div>

        `;

      })
      .join("");


  // ========================================================
  // HTML DOS DETALHES
  // ========================================================

  content.innerHTML = `

    <div class="space-y-6 pb-20">


      ${
        product.images?.[0]

          ? `

            <img

              src="${product.images[0]}"

              alt="${product.name}"

              class="
                w-full
                h-48
                object-cover
                rounded-xl
                shadow-sm
              "

              onerror="
                this.style.display='none';
              "

            />

          `

          : ""
      }


      <div>

        <h2
          class="
            text-2xl
            font-bold
            text-gray-800
          "
        >

          ${product.name}

        </h2>


        <p
          class="
            text-gray-500
            text-sm
            mt-1
          "
        >

          ${product.description || ""}

        </p>

      </div>


      <div>

        <h3
          class="
            font-bold
            text-xs
            text-gray-500
            uppercase
            mb-3
          "
        >

          1. Escolha o Tamanho

        </h3>


        <div class="flex gap-2">

          ${skusHTML}

        </div>

      </div>


      <div id="sku-attributes-container"></div>


      <div id="modifiers-dynamic-container">

        ${modifiersHTML}

      </div>


      <div
        class="
          flex
          items-center
          justify-between
          pt-4
          border-t
        "
      >

        <span
          class="
            font-bold
            text-gray-700
          "
        >

          Quantidade do pedido

        </span>


        <div
          class="
            flex
            items-center
            gap-4
            bg-gray-100
            rounded-xl
            p-1
          "
        >

          <button
            type="button"
            onclick="updateQty('main-qty', -1)"
            class="
              w-10
              h-10
              bg-white
              rounded-lg
              shadow-sm
              text-xl
              font-bold
            "
          >

            -

          </button>


          <input

            type="number"

            id="main-qty"

            value="1"

            class="
              w-8
              text-center
              font-bold
              bg-transparent
              border-none
            "

            readonly

          />


          <button
            type="button"
            onclick="updateQty('main-qty', 1)"
            class="
              w-10
              h-10
              bg-white
              rounded-lg
              shadow-sm
              text-xl
              font-bold
            "
          >

            +

          </button>

        </div>

      </div>


      <div class="pt-4">

        <h3
          class="
            font-bold
            text-xs
            text-gray-500
            uppercase
            mb-2
          "
        >

          Alguma observação?

        </h3>


        <textarea

          id="product-note"

          placeholder="Ex: Alguma observação..."

          class="
            w-full
            p-3
            bg-gray-50
            border
            border-gray-200
            rounded-xl
            text-sm
            focus:ring-2
            focus:ring-red-600
            outline-none
            resize-none
          "

          rows="3"

        ></textarea>

      </div>

    </div>

  `;


  // Renderiza atributos
  renderAttributes(0);


  // Calcula preço
  updateTotal();

}




// ============================================================
// QUANTIDADE DOS MODIFICADORES
// ============================================================

function updateModifierQty(
  groupIndex,
  itemSafeId,
  delta
) {

  const input =
    document.getElementById(
      `mod-${groupIndex}-${itemSafeId}`
    );


  if (!input) return;


  const groupName =
    input.dataset.group || "";


  const maxLimit =
    parseInt(
      input.dataset.max || "999",
      10
    );


  const inputsDoGrupo =
    document.querySelectorAll(
      `.modifier-qty[data-group="${CSS.escape(groupName)}"]`
    );


  let totalAtualNoGrupo = 0;


  inputsDoGrupo.forEach(
    (element) => {

      totalAtualNoGrupo +=
        parseInt(
          element.value || "0",
          10
        );

    }
  );


  const valorAtualItem =
    parseInt(
      input.value || "0",
      10
    );


  let novoValorItem =
    valorAtualItem + delta;


  // Nunca menor que zero
  if (novoValorItem < 0) {
    return;
  }


  // Respeita máximo do grupo
  if (
    delta > 0 &&
    totalAtualNoGrupo >= maxLimit
  ) {

    return;
  }


  input.value =
    novoValorItem;


  updateTotal();

}




// ============================================================
// ATRIBUTOS DO SKU
// ============================================================

function renderAttributes(skuIndex) {

  const container =
    document.getElementById(
      "sku-attributes-container"
    );


  if (!container) return;


  if (
    !currentProduct ||
    !Array.isArray(currentProduct.skus)
  ) {

    container.innerHTML = "";

    return;
  }


  const sku =
    currentProduct.skus[skuIndex];


  if (
    !sku ||
    !sku.attributes
  ) {

    container.innerHTML = "";

    return;
  }


  const values =
    Object.values(
      sku.attributes
    );


  if (!values.length) {

    container.innerHTML = "";

    return;
  }


  container.innerHTML = `

    <div class="mt-4">

      <h3
        class="
          font-bold
          text-xs
          text-gray-500
          uppercase
          mb-2
        "
      >

        Escolha uma opção

      </h3>


      <div class="flex flex-wrap gap-2">

        ${values
          .map(
            (value, index) => `

              <label class="cursor-pointer">

                <input

                  type="radio"

                  name="selected-flavor"

                  onchange="updateTotal()"

                  value="${value}"

                  class="peer hidden"

                  ${
                    index === 0
                      ? "checked"
                      : ""
                  }

                />


                <div
                  class="
                    px-4
                    py-2
                    border
                    rounded-full
                    peer-checked:bg-red-600
                    peer-checked:text-white
                    transition-all
                    text-sm
                  "
                >

                  ${value}

                </div>

              </label>

            `
          )
          .join("")}

      </div>

    </div>

  `;

}




// ============================================================
// ATUALIZAR QUANTIDADE PRINCIPAL
// ============================================================

function updateQty(id, delta) {

  const input =
    document.getElementById(id);


  if (!input) return;


  let currentValue =
    parseInt(
      input.value || "1",
      10
    );


  let newVal =
    currentValue + delta;


  if (id === "main-qty") {

    const selectedSku =
      document.querySelector(
        'input[name="sku-opt"]:checked'
      );


    const maxStock =
      selectedSku

        ? parseInt(
            selectedSku.dataset.stock || "0",
            10
          )

        : 99;


    if (newVal < 1) {
      newVal = 1;
    }


    if (
      maxStock > 0 &&
      newVal > maxStock
    ) {

      if (
        typeof Toast !== "undefined" &&
        Toast &&
        typeof Toast.fire === "function"
      ) {

        Toast.fire({
          icon: "warning",
          title:
            `Ops! Só temos ${maxStock} unidades em estoque.`
        });

      } else {

        console.warn(
          `Só temos ${maxStock} unidades em estoque.`
        );

      }


      newVal =
        maxStock;

    }

  } else {

    if (newVal < 0) {
      newVal = 0;
    }

  }


  input.value =
    newVal;


  updateTotal();

}




// ============================================================
// RESETAR QUANTIDADE
// ============================================================

function resetMainQty() {

  const input =
    document.getElementById(
      "main-qty"
    );


  if (input) {
    input.value = 1;
  }

}



// ============================================================
// ATUALIZAR TOTAL
// ============================================================

function updateTotal() {

  const selectedSku =
    document.querySelector(
      'input[name="sku-opt"]:checked'
    );


  const qtyInput =
    document.getElementById(
      "main-qty"
    );


  const mainQty =
    qtyInput
      ? Math.max(
          1,
          parseInt(
            qtyInput.value || "1",
            10
          )
        )
      : 1;


  let basePrice =
    selectedSku

      ? parseFloat(
          selectedSku.value || "0"
        )

      : 0;


  let modifiersTotal = 0;


  document
    .querySelectorAll(
      ".modifier-qty"
    )
    .forEach((input) => {

      const quantity =
        parseInt(
          input.value || "0",
          10
        );


      const price =
        parseFloat(
          input.dataset.price || "0"
        );


      modifiersTotal +=
        quantity * price;

    });


  const finalTotal =
    (basePrice + modifiersTotal) *
    mainQty;


  const priceDisplay =
    document.getElementById(
      "detail-total-price"
    );


  if (priceDisplay) {

    priceDisplay.innerText =
      finalTotal.toLocaleString(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL"
        }
      );

  }

};





document.addEventListener("click", function (event) {

  const btn = event.target.closest("#btn-add-cart");

  if (!btn) {
    return;
  }


  // ==========================================
  // 1. VERIFICA PRODUTO
  // ==========================================

  if (!currentProduct) {

    Swal.fire({
      icon: "error",
      title: "Produto não carregado",
      text: "Não foi possível identificar o produto."
    });

    return;
  }


  // ==========================================
  // 2. STATUS DO PRODUTO
  // ==========================================

  const productStatus =
    String(currentProduct.status || "").toUpperCase();

  if (productStatus !== "ACTIVE") {

    Swal.fire({
      icon: "error",
      title: "Produto indisponível",
      text:
        `O item "${currentProduct.name}" está indisponível.`
    });

    return;
  }


  // ==========================================
  // 3. GRUPOS DE ADICIONAIS
  // ==========================================

  const groups =
    Array.isArray(currentProduct.modifiers)
      ? currentProduct.modifiers
      : [];


  // ==========================================
  // 4. VALIDA MIN / MAX
  // ==========================================

  for (const group of groups) {

    const activeItems =
      Array.isArray(group.items)
        ? group.items.filter(
            item =>
              String(item.status || "").toUpperCase() === "ACTIVE"
          )
        : [];


    if (activeItems.length === 0) {
      continue;
    }


    const groupName =
      group.name || "";


    const inputs =
      document.querySelectorAll(
        `.modifier-qty[data-group="${CSS.escape(groupName)}"]`
      );


    const totalSelected =
      Array.from(inputs).reduce(
        (sum, input) =>
          sum + (parseInt(input.value, 10) || 0),
        0
      );


    const min =
      Number(group.min) || 0;


    const max =
      Number(group.max) || 999;


    if (totalSelected < min) {

      if (
        typeof Toast !== "undefined" &&
        Toast &&
        typeof Toast.fire === "function"
      ) {

        Toast.fire({
          icon: "warning",
          title:
            `O grupo "${groupName}" é obrigatório.`,
          text:
            `Selecione pelo menos ${min} item(ns).`
        });

      } else {

        alert(
          `O grupo "${groupName}" é obrigatório. Selecione pelo menos ${min} item(ns).`
        );

      }

      return;
    }


    if (totalSelected > max) {

      if (
        typeof Toast !== "undefined" &&
        Toast &&
        typeof Toast.fire === "function"
      ) {

        Toast.fire({
          icon: "error",
          title: "Limite excedido",
          text:
            `O grupo "${groupName}" permite no máximo ${max} item(ns).`
        });

      } else {

        alert(
          `O grupo "${groupName}" permite no máximo ${max} item(ns).`
        );

      }

      return;
    }

  }


  // ==========================================
  // 5. SKU
  // ==========================================

  const skuElement =
    document.querySelector(
      'input[name="sku-opt"]:checked'
    );


  if (!skuElement) {

    alert("⚠️ Nenhum SKU selecionado.");

    return;
  }


  const basePrice =
    parseFloat(
      skuElement.value || "0"
    ) || 0;


  // ==========================================
  // 6. QUANTIDADE
  // ==========================================

  const qtyElement =
    document.getElementById("main-qty");


  const mainQty =
    Math.max(
      1,
      parseInt(
        qtyElement?.value || "1",
        10
      )
    );


  // ==========================================
  // 7. ATRIBUTO / SABOR
  // ==========================================

  const flavorElement =
    document.querySelector(
      'input[name="selected-flavor"]:checked'
    );


  const flavor =
    flavorElement
      ? flavorElement.value
      : "";


  // ==========================================
  // 8. ADICIONAIS
  // ==========================================

  const selectedExtras = [];

  let modifiersTotal = 0;


  document
    .querySelectorAll(".modifier-qty")
    .forEach(input => {

      const qty =
        parseInt(
          input.value || "0",
          10
        );


      if (qty <= 0) {
        return;
      }


      const groupName =
        input.dataset.group || "";


      const itemName =
        input.dataset.name || "";


      const price =
        parseFloat(
          input.dataset.price || "0"
        ) || 0;


      const group =
        currentProduct.modifiers?.find(
          g => g.name === groupName
        );


      const item =
        group?.items?.find(
          i => i.name === itemName
        );


      const status =
        String(
          item?.status || ""
        ).toUpperCase();


      if (status !== "ACTIVE") {

        console.warn(
          "⚠️ Adicional bloqueado:",
          itemName,
          status
        );

        return;
      }


      modifiersTotal +=
        qty * price;


      for (let i = 0; i < qty; i++) {

        selectedExtras.push({
          group: groupName,
          name: itemName,
          price: price
        });

      }

    });


  // ==========================================
  // 9. OBSERVAÇÃO
  // ==========================================

  const notes =
    document.getElementById(
      "product-note"
    )?.value || "";


  // ==========================================
  // 10. PREÇO
  // ==========================================

  const unitPrice =
    basePrice + modifiersTotal;


  const totalPrice =
    unitPrice * mainQty;


  // ==========================================
  // 11. MONTA ITEM
  // ==========================================

  const itemParaCarrinho = {

    cartId: Date.now(),

    productId:
      currentProduct.id,

    name:
      currentProduct.name,

    size:
      skuElement.dataset.name || "Padrão",

    flavor:
      flavor,

    extras:
      selectedExtras,

    notes:
      notes,

    unitPrice:
      unitPrice,

    price:
      totalPrice,

    quantity:
      mainQty

  };


  console.log(
    "🛒 ITEM PARA CARRINHO:",
    itemParaCarrinho
  );


  // ==========================================
  // 12. GARANTE QUE CART EXISTE
  // ==========================================

  if (!Array.isArray(cart)) {
    cart = [];
  }


  // ==========================================
  // 13. ADICIONA
  // ==========================================

  cart.push(
    itemParaCarrinho
  );


  // ==========================================
  // 14. LOCALSTORAGE
  // ==========================================

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );


  console.log(
    "🛒 CARRINHO ATUAL:",
    cart
  );


  // ==========================================
  // 15. ATUALIZA INTERFACE
  // ==========================================

  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }


  if (typeof renderCart === "function") {
    renderCart();
  }


  // ==========================================
  // 16. VAI PARA SACOLA
  // ==========================================

  if (typeof switchTab === "function") {
    switchTab("cart");
  }

});




// Garanta que exista um Event Listener para atualizar o carrinho quando o pagamento mudar
document
  .getElementById("payment-method")
  ?.addEventListener("change", renderCart);

function renderCart() {
  const container = document.getElementById("cart-items");
  const summary = document.getElementById("cart-summary");

  if (cart.length === 0) {
    container.innerHTML =
      '<p class="text-center text-gray-400 py-10">Seu carrinho está vazio</p>';
    summary.classList.add("hidden");
    return;
  }

  summary.classList.remove("hidden");

  // Resetar o subtotal para não acumular valores duplicados ao re-renderizar
  let subtotal = 0;

  container.innerHTML = cart
    .map((item) => {
      subtotal += item.price;

      // Lógica para formatar os extras
      const extrasFormatados = item.extras.reduce((acc, current) => {
        if (!acc[current.group]) acc[current.group] = [];
        acc[current.group].push(current.name);
        return acc;
      }, {});

      const extrasText = Object.keys(extrasFormatados)
        .map((groupName) => {
          return `<b class="text-gray-600">${groupName}:</b> ${extrasFormatados[groupName].join(", ")}`;
        })
        .join("<br>");

      const noteText = item.notes
        ? `<div class="mt-1 px-2 py-1 bg-blue-50 border-l-2 border-blue-400 text-[10px] text-blue-700 italic">Obs: ${item.notes}</div>`
        : "";

      return `
        <div class="bg-white p-4 rounded-2xl border border-gray-100 mb-3 shadow-sm">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-bold text-sm text-gray-800">${item.quantity}x ${item.name}</h4>
                    <p class="text-[10px] text-gray-500 uppercase font-semibold mt-0.5">
                        Tamanho: ${item.size} ${item.flavor ? `| Sabor: ${item.flavor}` : ""}
                    </p>
                    
                    <div class="text-[10px] text-gray-400 mt-2 leading-relaxed">
                        ${extrasText ? extrasText : "Sem adicionais"}
                    </div>
                    
                    ${noteText}
                </div>
                <div class="text-right ml-4">
                    <button onclick="removeFromCart(${item.cartId})" class="text-gray-300 hover:text-red-500 transition">
                        <i class="fas fa-times-circle"></i>
                    </button>
                    <p class="text-red-600 font-bold text-sm mt-4">R$ ${item.price.toFixed(2).replace(".", ",")}</p>
                </div>
            </div>
            <div class="mt-4 text-left">
              <button 
                type="button"
                onclick="switchTab('menu');" 
                class="inline-flex items-center gap-1.5 text-xs font-bold text-[#ea1d2c] hover:text-[#c4121f] transition-colors py-1 group"
              >
                <i class="fas fa-plus-circle text-[#ea1d2c] group-hover:text-[#c4121f] transition-colors"></i> 
                Continuar comprando (adicionar mais itens)
              </button>
            </div>
        </div>
      `;
    })
    .join("");

  // --- LÓGICA DA TAXA DE CARTÃO ---
  const paymentMethod = document.getElementById("payment-method")?.value;
  let cardFee = 0;

  if (paymentMethod === "CARTAO_CREDITO" || paymentMethod === "CARTAO_DEBITO") {
    cardFee = 1.0;
  }

  const cardFeeContainer = document.getElementById("card-fee-container");
  const cardFeeDisplay = document.getElementById("cart-card-fee");

  if (cardFeeContainer && cardFeeDisplay) {
    if (cardFee > 0) {
      cardFeeDisplay.innerText = `R$ ${cardFee.toFixed(2).replace(".", ",")}`;
      cardFeeContainer.classList.remove("hidden");
    } else {
      cardFeeContainer.classList.add("hidden");
    }
  }

  // --- ATUALIZAÇÃO DOS VALORES NO DOM ---
  document.getElementById("cart-subtotal").innerText =
    `R$ ${subtotal.toFixed(2).replace(".", ",")}`;

  if (document.getElementById("cart-shipping")) {
    const taxa = typeof taxaEntregaAtual !== "undefined" ? taxaEntregaAtual : 0;

    // 🔥 CORREÇÃO VISUAL: Se o cupom de frete grátis estiver aplicado, mostra "Grátis"
    if (
      appliedCouponCode === "FRETEGRATIS" ||
      appliedCouponCode === "QUEROFRETE"
    ) {
      document.getElementById("cart-shipping").innerText = "Grátis";
    } else {
      document.getElementById("cart-shipping").innerText =
        `R$ ${taxa.toFixed(2).replace(".", ",")}`;
    }
  }

  // 🔥 ADICIONE ESTA LINHA AQUI: Gatilho de segurança silencioso
  // Ele vai checar se o cupom atual ainda bate com este 'subtotal' novo
  revalidarCupomAtivo(subtotal);

  // --- CENTRALIZAÇÃO DO CÁLCULO DO TOTAL COM CUPOM ---
  // Chamamos a função central para calcular o total abatendo o cupom (se houver) e somando a taxa do cartão
  recalcularTotalGeralCompleto(subtotal, cardFee);
}

// ==========================================
// FUNÇÃO AUXILIAR: CENTRALIZA O CÁLCULO COMPLETO DO TOTAL
// ==========================================
function recalcularTotalGeralCompleto(subtotal, cardFee = 0) {
  const taxa = typeof taxaEntregaAtual !== "undefined" ? taxaEntregaAtual : 0;

  // 🔒 TRAVA DE SEGURANÇA: Se o cupom for de frete grátis, força a variável global a ser 0
  if (
    appliedCouponCode === "FRETEGRATIS" ||
    appliedCouponCode === "QUEROFRETE"
  ) {
    taxaEntregaAtual = 0;
  }

  // Se não foi passado cardFee manualmente (ex: vindo da validação do cupom), calcula dinamicamente
  if (cardFee === 0) {
    const paymentMethod = document.getElementById("payment-method")?.value;
    if (
      paymentMethod === "CARTAO_CREDITO" ||
      paymentMethod === "CARTAO_DEBITO"
    ) {
      cardFee = 1.0;
    }
  }

  // Deduz o cupom global ativo (computedDiscount)
  const totalGeral = subtotal + taxa + cardFee - computedDiscount;
  const totalFinalSeguro = Math.max(0, totalGeral);

  // Injeta o valor final formatado em Real no ID correspondente
  document.getElementById("cart-total").innerText =
    `R$ ${totalFinalSeguro.toFixed(2).replace(".", ",")}`;
}

function updateCartBadge() {
  const b = document.getElementById("cart-badge");
  if (!b) return; // Proteção caso o elemento não exista em alguma página

  b.innerText = cart.length;
  b.classList.toggle("hidden", cart.length === 0);
}

async function logout() {
  try {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error(err);
  }

  currentUser = null;
  cart = [];
  localStorage.clear();
  sessionStorage.clear();

  // força apagar qualquer cache visual
  document.getElementById("menu-section").classList.add("hidden");
  document.getElementById("bottom-nav").classList.add("hidden");

  // volta login SEM reload
  switchTab("auth");

  Toast.fire({
    icon: "success",
    title: "Logout realizado com sucesso",
  });
}

function toggleAddressField() {
  const typeEl = document.getElementById("order-type");
  const addrField = document.getElementById("order-address");

  if (typeEl && addrField) {
    const type = typeEl.value;
    // Se for PICKUP (Retirada), esconde o campo de endereço
    addrField.style.display = type === "DELIVERY" ? "block" : "none";
  }
}

function toggleAddressField() {
  const type = document.getElementById("order-type").value;
  const addrField = document.getElementById("order-address");
  addrField.style.display = type === "DELIVERY" ? "block" : "none";
}

async function checkout() {
  if (cart.length === 0)
    return Toast.fire({ icon: "error", title: "Carrinho vazio" });

  const nomeCliente = document.getElementById("client-name").value;
  const foneCliente = document.getElementById("client-phone").value;
  const orderType = document.getElementById("order-type").value;
  const address = document.getElementById("order-address").value;
  const concordouTermos = document.getElementById("check-termos").checked;

  if (!nomeCliente || !foneCliente) {
    return Swal.fire({
      icon: "warning",
      title: "Dados incompletos",
      text: "Nome e WhatsApp são obrigatórios.",
    });
  }

  // 🔥 VALIDAÇÃO DO DELIVERY
  let bairro = "";
  if (orderType === "DELIVERY") {
    bairro = document.getElementById("address-neighborhood").value;
    const endereco = address.trim();

    // 1. Verifica se os campos básicos estão vazios
    if (!endereco || !bairro || bairro === "" || bairro === "selecione") {
      return Swal.fire({
        icon: "warning",
        title: "Dados de entrega incompletos",
        text: "Por favor, preencha o endereço completo e selecione o bairro para a entrega.",
      });
    }
  }

  // 3. Validação dos Termos
  if (!concordouTermos)
    return Toast.fire({
      icon: "info",
      title: "Aceite os termos para continuar",
    });

  // 🛒 CÁLCULO DO SUBTOTAL (Multiplicando pela quantidade para evitar erros de soma)
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

  // Certifique-se de que 'taxaEntregaAtual' existe globalmente no seu código
  const taxaEntrega =
    orderType === "DELIVERY"
      ? typeof taxaEntregaAtual !== "undefined"
        ? taxaEntregaAtual
        : 0
      : 0;

  // 🔥 CAPTURA DO MÉTODO DE PAGAMENTO
  const metodoPagamento = document.getElementById("payment-method").value;

  // 💳 Lógica da taxa do cartão (R$ 1,00) se for Crédito ou Débito
  let taxaCartao = 0;
  if (
    metodoPagamento === "CARTAO_CREDITO" ||
    metodoPagamento === "CARTAO_DEBITO"
  ) {
    taxaCartao = 1.0;
  }

  const valorTotalPedido = subtotal + taxaEntrega + taxaCartao;

  // 💰 Captura e Validação de Troco para Dinheiro
  let valorTrocoPara = null;

  if (metodoPagamento === "DINHEIRO") {
    const inputTroco = document.getElementById("change-amount");
    if (inputTroco && inputTroco.value.trim() !== "") {
      valorTrocoPara = parseFloat(inputTroco.value);

      if (valorTrocoPara < valorTotalPedido) {
        return Swal.fire({
          icon: "warning",
          title: "Valor de troco inválido",
          text: `O valor para troco (R$ ${valorTrocoPara.toFixed(2).replace(".", ",")}) não pode ser menor que o total do pedido (R$ ${valorTotalPedido.toFixed(2).replace(".", ",")}).`,
        });
      }
    }
  }

  // Montagem do endereço string completo para o backend/cliente
  const enderecoCompleto =
    orderType === "DELIVERY"
      ? `${address}`
      : "Retirada no local";

  const pedidoFinal = {
    companyId: typeof storeTag !== "undefined" ? storeTag : "STORE_DEFAULT",
    entity: "Pedido",
    entityId: `PED-${Date.now()}`,
    actor: { id: "000000000000000000000000", role: "CUSTOMER" },

    cliente: {
      nome: nomeCliente,
      telefone: foneCliente,
      endereco: enderecoCompleto,
      email: "cliente_avulso@prafood.com",
    },
    // --- BLOCO DE SEGURANÇA JURÍDICA ---
    consentimento: {
      aceitou: true,
      dataHoraAceite: new Date().toISOString(),
      userAgent: navigator.userAgent,
      versaoTermos: "v1.2024-05",
      conteudoTermos:
        typeof legalData !== "undefined"
          ? legalData.termos.content
          : "Termos aceitos no checkout",
      conteudoPrivacidade:
        typeof legalData !== "undefined"
          ? legalData.privacidade.content
          : "Privacidade aceita no checkout",
    },
    // ----------------------------------------------
    itens: cart.map((item) => ({
      productId: item.productId,
      name: item.name,
      size: item.size,
      quantity: item.quantity,
      extras: item.extras
        ? item.extras.map((e) => (typeof e === "object" ? e.name : e))
        : [],
      notes: item.notes || "",
    })),
    // 🔥 AS TRÊS LINHAS ABAIXO INTEGRAM TODOS OS CUPONS COM O BACKEND:
    cupom: appliedCouponCode, // Ex: "QUERO10" ou "FRETEGRATIS"
    desconto: computedDiscount, // Ex: 10.40 (o valor calculado pelo front para o backend abater)
    pagamento: {
      metodo: metodoPagamento,
      total: valorTotalPedido,
      trocoPara: valorTrocoPara,
    },
    entrega: {
      tipo: orderType,
      endereco: enderecoCompleto,
      taxaEntrega,
    },
  };

  // Função auxiliar interna para limpar o estado do app após finalizar o processo
  const limparCarrinhoNoSucesso = () => {
    cart = [];
    localStorage.removeItem("cart");
    if (typeof updateCartBadge === "function") updateCartBadge();
    if (typeof renderCart === "function") renderCart();
  };

  try {
    const pedidoSalvo = await criarPedidoNoSistema(pedidoFinal);
    enviarParaWhatsApp(pedidoSalvo, cart);
    limparCarrinhoNoSucesso();
  } catch (err) {
    console.error("Erro no checkout:", err);
    Swal.fire({
      icon: "warning",
      title: "Pedido enviado via WhatsApp",
      text: "Houve um erro ao registrar no banco, mas você pode seguir pelo WhatsApp.",
      confirmButtonText: "Abrir WhatsApp",
    }).then(() => {
      enviarParaWhatsApp(pedidoFinal, cart);
      limparCarrinhoNoSucesso(); // Limpa o carrinho mesmo indo pelo fluxo alternativo (WhatsApp)
    });
  }
}

function enviarParaWhatsApp(pedido, itensDoCarrinho) {
  const agora = new Date();

  // Ajuste para pegar a taxa de entrega se existir, ou 0
  const taxa = pedido.entrega?.taxaEntrega || 0;

  // 💳 NOVO: Descobre a taxa do cartão localmente olhando apenas para o método de pagamento
  const metodoPagamentoRaw = pedido.pagamento?.metodo || "Não informado";
  let taxaCartao = 0;
  if (
    metodoPagamentoRaw === "CREDIT_CARD" ||
    metodoPagamentoRaw === "DEBIT_CARD"
  ) {
    taxaCartao = 1.0;
  }

  // Formatação dos itens
  const itensTexto = itensDoCarrinho
    .map((item) => {
      // Formata os extras removendo espaços extras
      const extrasFormatados =
        item.extras && item.extras.length > 0
          ? item.extras
              .map((e) => (typeof e === "object" ? e.name.trim() : e.trim()))
              .filter((e) => e !== "") // Remove itens vazios
              .join(", ")
          : "";

      const descExtra = extrasFormatados
        ? `\n   ┗━━ ➕ *Add:* ${extrasFormatados}`
        : "";

      // No seu JSON o campo é "notes"
      const descObs = item.notes?.trim()
        ? `\n   ┗━━ 📝 *Obs:* _${item.notes}_`
        : "";

      // CORREÇÃO: No JSON enviado, a propriedade é unitPrice, não price
      const valorUnitario = item.unitPrice || 0;

      return `🛍️ *${item.quantity}x ${item.name.toUpperCase()}*\n🔹 Tam: ${item.size}${descExtra}${descObs}\n💰 _R$ ${valorUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}_`;
    })
    .join("\n\n---\n\n");

  // Verificações de segurança para campos que podem vir vazios no objeto pagamento
  const totalPedido = pedido.pagamento?.total || 0;
  const metodoPagamento = pedido.pagamento?.metodo || "Não informado";
  const tipoEntrega =
    pedido.entrega?.tipo === "DELIVERY" ? "🚀 Delivery" : "🏢 Retirada";

  // 💰 LOGICA DO TROCO ADICIONADA AQUI
  let blocoTroco = "";
  if (metodoPagamento === "DINHEIRO" && pedido.pagamento?.trocoPara) {
    const pagoCom = pedido.pagamento.trocoPara;
    const valorTroco = pagoCom - totalPedido;

    // Se o valor digitado for maior que o total, calcula o troco; se não, avisa que é valor exato
    if (valorTroco > 0) {
      blocoTroco = `\n💵 *PAGO COM:* R$ ${pagoCom.toFixed(2).replace(".", ",")}\n🔄 *LEVAR TROCO DE:* R$ ${valorTroco.toFixed(2).replace(".", ",")}`;
    } else {
      blocoTroco = `\n💵 *PAGO COM:* Valor exato (R$ ${totalPedido.toFixed(2).replace(".", ",")})`;
    }
  }

  // 💳 NOVO: Bloco de texto montado localmente se houver taxa de cartão
  const blocoTaxaCartao =
    taxaCartao > 0
      ? `\n💳 *TAXA CARTÃO:* R$ ${taxaCartao.toFixed(2).replace(".", ",")}`
      : "";

  const textoZap = `
📌 *PEDIDO #${pedido.id || "NOVO"}*
------------------------------------------------
👤 *CLIENTE:* ${pedido.cliente.nome}
📞 *FONE:* ${pedido.cliente.telefone}
📍 *TIPO:* ${tipoEntrega}
🏠 *END:* ${pedido.cliente.endereco}
------------------------------------------------
🛒 *ITENS:*

${itensTexto}

------------------------------------------------
🚚 *TAXA:* R$ ${taxa.toFixed(2).replace(".", ",")}${blocoTaxaCartao}
💰 *TOTAL: R$ ${totalPedido.toFixed(2).replace(".", ",")}*
💳 *PAGAMENTO:* ${metodoPagamento}${blocoTroco}
------------------------------------------------
⏰ ${agora.toLocaleString("pt-BR")}
`;

  const foneLoja = "5588999935987";
  const url = `https://api.whatsapp.com/send?phone=${foneLoja}&text=${encodeURIComponent(textoZap)}`;

  window.open(url, "_blank");
}

async function criarPedidoNoSistema(pedidoFinal) {
  Swal.fire({
    title: "Processando pedido...",
    didOpen: () => Swal.showLoading(),
    allowOutsideClick: false,
  });

  const res = await fetch(`https://essenzaintimasapi.onrender.com/pedidos`, {
    // Usando a constante de ambiente que definimos antes
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedidoFinal),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || result.message || "Erro ao salvar pedido.");
  }

  return result.data; // Retorna o pedido criado (contendo o ID gerado pelo banco)
}

window.onload = async () => {
  // Recuperar carrinho do LocalStorage
  const cartSalvo = localStorage.getItem("cart");
  if (cartSalvo) {
    try {
      cart = JSON.parse(cartSalvo);
      updateCartBadge();
    } catch (e) {
      cart = [];
    }
  }

  // Abre direto no Menu, sem verificar sessão
  showMenu();
};

async function fetchOrdersByPhone() {
  const phone = document.getElementById("search-phone").value;
  const container = document.getElementById("orders-list");

  if (!phone) {
    return Toast.fire({
      icon: "warning",
      title: "Campo obrigatório",
      text: "Digite um telefone para buscar.",
    });
  }

  container.innerHTML =
    '<p class="text-center text-gray-400 py-10">Buscando pedidos...</p>';

  try {
    const response = await fetch(
      `https://essenzaintimasapi.onrender.com/pedidos/telefone/${phone}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error("Não foi possível encontrar pedidos.");

    const orders = await response.json();
    renderOrders(orders);
  } catch (err) {
    container.innerHTML = `<p class="text-center text-red-500 py-10">${err.message}</p>`;
  }
}

function renderOrders(orders) {
  const container = document.getElementById("orders-list");

  if (!orders || orders.length === 0) {
    container.innerHTML =
      '<p class="text-center text-gray-400 py-10">Nenhum pedido encontrado.</p>';
    return;
  }

  // Número da loja (substitua pelo número real ou pegue da API se disponível)
  const storePhone = "5588999935987";

  container.innerHTML = orders
    .map((order) => {
      // Criar mensagem personalizada para o WhatsApp
      const msg = encodeURIComponent(
        `Olá! Gostaria de informações sobre o meu pedido ID: ${order.id}`,
      );
      const waLink = `https://wa.me/${storePhone}?text=${msg}`;

      return `
        <div class="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ID: ${order.id}</span>
                    <h4 class="text-sm font-bold text-gray-800">${new Date(order.createdAt).toLocaleDateString("pt-BR")} às ${new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</h4>
                </div>
                <span class="px-2 py-1 rounded text-[10px] font-bold ${order.status === "PREPARING" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}">
                    ${order.status}
                </span>
            </div>
            
            <div class="space-y-1 mb-3">
                ${order.itens
                  .map(
                    (item) => `
                    <div class="flex justify-between text-xs text-gray-600">
                        <span>${item.quantity}x ${item.name}</span>
                        <span>R$ ${item.totalPrice.toFixed(2)}</span>
                    </div>
                `,
                  )
                  .join("")}
            </div>

            <div class="border-t pt-3 flex justify-between items-center">
                <div class="flex flex-col">
                    <span class="text-xs font-semibold text-gray-500">Total</span>
                    <span class="text-sm font-bold text-gray-800">R$ ${order.pagamento.total.toFixed(2)}</span>
                </div>
                
                <a href="${waLink}" target="_blank" class="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.674 1.436 5.662 1.436h.008c6.548 0 11.88-5.335 11.883-11.892a11.785 11.785 0 00-3.488-8.412z"/></svg>
                    Suporte
                </a>
            </div>
        </div>
        `;
    })
    .reverse()
    .join("");
}

const foneInput = document.getElementById("client-phone");

foneInput.addEventListener("input", (e) => {
  let value = e.target.value;

  // 1. Remove tudo que não for número
  value = value.replace(/\D/g, "");

  // 2. Limita a 11 caracteres (padrão Brasil)
  if (value.length > 11) {
    value = value.slice(0, 11);
  }

  // 3. Aplica a máscara dinamicamente
  if (value.length > 10) {
    // Formato Celular: (XX) XXXXX-XXXX
    value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (value.length > 6) {
    // Formato Fixo ou celular incompleto: (XX) XXXX-XXXX
    value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (value.length > 2) {
    // Formato com DDD: (XX) XXXX
    value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  } else if (value.length > 0) {
    // Apenas o DDD: (XX
    value = value.replace(/^(\d{0,2})/, "($1");
  }

  e.target.value = value;
});

// 1. MÁSCARA DO TELEFONE (Protegido contra erro de elemento inexistente/null)
const searchphone = document.getElementById("search-phone");

if (searchphone) {
  searchphone.addEventListener("input", (e) => {
    let value = e.target.value;

    // Remove tudo que não for número
    value = value.replace(/\D/g, "");

    // Limita a 11 caracteres
    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    // Aplica a máscara dinamicamente
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    } else if (value.length > 0) {
      value = value.replace(/^(\d{0,2})/, "($1");
    }

    e.target.value = value;
  });
}

// 2. CONTEÚDOS DOS TERMOS E PRIVACIDADE
const legalData = {
  termos: {
    title: "Termos de Uso e Fluxo do Pedido",
    content: `
        <h4 class="font-bold text-gray-800 mt-2">1. Objeto e Funcionamento do Sistema</h4>
        <p class="text-gray-600 text-xs">O PraFood atua como plataforma de intermediação tecnológica. Ao finalizar uma compra, seu pedido é primeiramente registrado de forma segura em nosso banco de dados e, em seguida, direcionado ao canal de atendimento (WhatsApp) do estabelecimento para validação.</p>
        
        <h4 class="font-bold text-gray-800 mt-3">2. Notificações e Atualizações de Status</h4>
        <p class="text-gray-600 text-xs">O usuário concorda em receber mensagens automáticas e notificações em seu WhatsApp informando sobre as atualizações do status do seu pedido (ex: "Em Preparo", "Saiu para Entrega", "Disponível para Retirada") disparadas pelo painel administrativo da empresa.</p>

        <h4 class="font-bold text-gray-800 mt-3">3. Responsabilidades</h4>
        <p class="text-gray-600 text-xs">O estabelecimento comercial é o único e exclusivo responsável pelo preparo, acondicionamento, qualidade, precificação e logística de entrega dos produtos. O usuário é inteiramente responsável por fornecer dados exatos de contato e endereço.</p>
        
        <h4 class="font-bold text-gray-800 mt-3">4. Política de Cancelamento (CDC)</h4>
        <p class="text-gray-600 text-xs">Em conformidade com o Código de Defesa do Consumidor, tratando-se de produtos perecíveis e de consumo imediato, o cancelamento ou alteração do pedido só poderá ser efetuado antes do início do preparo por parte da cozinha do estabelecimento.</p>
        
        <h4 class="font-bold text-gray-800 mt-3">5. Pagamentos e Taxas</h4>
        <p class="text-gray-600 text-xs">Todos os valores dos itens, bem como as taxas de entrega calculadas por bairro/região, são estipulados diretamente pelo restaurante. Eventuais divergências ou falhas de processamento devem ser comunicadas imediatamente ao canal de suporte do estabelecimento.</p>
      `,
  },
  privacidade: {
    title: "Política de Privacidade e Proteção de Dados (LGPD)",
    content: `
        <div class="mb-2 p-2 bg-red-50 rounded-xl border border-red-100">
          <h4 class="font-black text-red-600 uppercase text-[10px] flex items-center gap-1">
            <i class="fas fa-shield-alt"></i> 100% Em Conformidade com a LGPD (Lei nº 13.709/18)
          </h4>
        </div>
        
        <p class="text-gray-600 text-xs mb-2"><strong>Dados Coletados estritamente necessários (Princípio da Minimização):</strong> Nome completo, número de telefone celular/WhatsApp e endereço completo de entrega.</p>
        
        <h4 class="font-bold text-gray-800 mt-3">1. Finalidade do Tratamento de Dados</h4>
        <p class="text-gray-600 text-xs">Seus dados pessoais são utilizados unicamente para as seguintes finalidades operacionais: Registrar o pedido de forma auditável no banco de dados, gerar a autenticação da compra, emitir as informações necessárias para a entrega física e permitir que o painel da empresa envie alertas de status do pedido para o seu WhatsApp.</p>
        
        <h4 class="font-bold text-gray-800 mt-3">2. Compartilhamento estrito para Operação</h4>
        <p class="text-gray-600 text-xs">Para que seu pedido seja atendido, seus dados de identificação e endereço são compartilhados apenas com a equipe interna do restaurante (gestão e cozinha) e com o agente logístico encarregado (entregador/motoboy). É expressamente vedada a venda, cessão ou compartilhamento desses dados com terceiros para fins de marketing.</p>
        
        <h4 class="font-bold text-gray-800 mt-3">3. Armazenamento e Histórico de Consentimento</h4>
        <p class="text-gray-600 text-xs">No momento do checkout, o sistema captura de forma digital o seu aceite, registrando a data, a hora e as especificações do dispositivo (User Agent), garantindo segurança jurídica para ambas as partes. Os dados permanecem salvos em ambiente seguro para fins de cumprimento de obrigação legal e histórico de pedidos.</p>

        <h4 class="font-bold text-gray-800 mt-3">4. Direitos do Titular dos Dados</h4>
        <p class="text-gray-600 text-xs">Você possui o direito de confirmar a existência do tratamento, acessar seus dados ou solicitar a exclusão definitiva de suas informações da nossa base de dados a qualquer momento, bastando formalizar a requisição junto ao suporte do estabelecimento.</p>
      `,
  },
};

// 3. FUNÇÕES DO MODAL LEGAL
window.openLegalModal = function (type) {
  const modal = document.getElementById("legalModal");
  const title = document.getElementById("modalTitle");
  const content = document.getElementById("modalContent");

  if (!modal || !title || !content || !legalData[type]) return;

  // Preenche o conteúdo
  title.innerText = legalData[type].title;
  content.innerHTML = legalData[type].content;

  // Força a exibição diretamente via estilo (evita falhas do Tailwind)
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
};

window.closeLegalModal = function () {
  const modal = document.getElementById("legalModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
};

// 4. FORMAS DE PAGAMENTO
function handlePaymentChange() {
  const paymentSelect = document.getElementById("payment-method");
  const pixBox = document.getElementById("pix-info-box");

  if (!paymentSelect || !pixBox) return;

  if (paymentSelect.value === "PIX") {
    pixBox.classList.remove("hidden");
  } else {
    pixBox.classList.add("hidden");
  }
}

// 5. COPIAR CHAVE PIX
function copySwalPix(buttonElement) {
  const keyElement = document.getElementById("swal-pix-key");

  if (!keyElement) {
    console.error("Elemento da chave Pix não encontrado no DOM.");
    return;
  }

  const keyText = keyElement.innerText.trim();

  navigator.clipboard
    .writeText(keyText)
    .then(() => {
      if (buttonElement) {
        const originalContent = buttonElement.innerHTML;

        buttonElement.disabled = true;
        buttonElement.style.backgroundColor = "#DEF7EC";
        buttonElement.style.borderColor = "#31C48D";
        buttonElement.innerHTML = `<i class="fas fa-check text-green-600"></i> <span class="text-green-800">Copiado com sucesso!</span>`;

        setTimeout(() => {
          buttonElement.style.backgroundColor = "";
          buttonElement.style.borderColor = "";
          buttonElement.innerHTML = originalContent;
          buttonElement.disabled = false;
        }, 2000);
      }
    })
    .catch((err) => {
      console.error("Erro ao copiar: ", err);
      const storage = document.createElement("textarea");
      storage.value = keyText;
      document.body.appendChild(storage);
      storage.select();
      document.execCommand("copy");
      document.body.removeChild(storage);

      if (buttonElement) {
        buttonElement.innerHTML = `<span>Chave copiada!</span>`;
        setTimeout(() => {
          buttonElement.innerHTML = originalContent;
        }, 2000);
      }
    });
}

// INICIALIZAÇÃO SEGURA
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("payment-method")) {
    handlePaymentChange();
  }
});

// ==========================================
// CONFIGURAÇÃO DOS BAIRROS E CONFIGURAÇÃO DE SEGURANÇA
// ==========================================

// Lista oficial de bairros mantida de forma segura no código JS
const LISTA_BAIRROS = [
  { nome: "Vila Velha 1", taxa: 0.0 },
  { nome: "Vila Velha 2", taxa: 0.0 },
  { nome: "Vila Velha 3", taxa: 0.0 },
  { nome: "Vila Velha 4", taxa: 0.0 },
  { nome: "Jardim Guanabara", taxa: 0.0 },
  { nome: "Quintino Cunha", taxa: 0.0 },
  { nome: "Olavo Oliveira", taxa: 0.0 },
  { nome: "Jardim Iracema", taxa: 0.0 },
  // Adicione novos bairros aqui: { nome: "Nome", taxa: 0.00 }
];

// --- FUNÇÕES DE HIGIENIZAÇÃO E VALIDAÇÃO (ANTI-FRAUDE) ---

function higenizarTextoSeguro(texto) {
  const div = document.createElement("div");
  div.innerText = texto;
  return div.innerHTML;
}

function validarTaxaSegura(valor) {
  const taxa = parseFloat(valor);
  if (isNaN(taxa) || taxa < 0 || !isFinite(taxa)) {
    console.warn("Tentativa de manipulação de valor detectada.");
    return 0;
  }
  return taxa;
}

// --- LÓGICA DE INJEÇÃO E EVENTOS ---

// Armazena os bairros globalmente após puxar da API, mantendo a compatibilidade com a sua lógica de input
let listaBairrosDisponiveis = [];
const API_URLTAXAS = "https://essenzaintimasapi.onrender.com/taxas"; // Sua URL corrigida do back-end

async function inicializarBairros() {
  const selectBairro = document.getElementById("address-neighborhood");
  const inputRua = document.getElementById("order-address");

  if (!selectBairro) return;

  try {
    // 1. Busca os bairros direto da sua nova API do banco de dados
    const response = await fetch(API_URLTAXAS);
    if (!response.ok) throw new Error("Falha ao carregar as taxas de entrega");

    const bairrosdoBanco = await response.json();

    // Filtra apenas os bairros que o administrador deixou ativos no painel
    listaBairrosDisponiveis = bairrosdoBanco.filter((b) => b.isActive);

    // 2. Monta as opções do Select dinamicamente
    let opcoesHTML = `<option value="" selected disabled>Selecione para usar taxa fixa...</option>`;

    listaBairrosDisponiveis.forEach((bairro) => {
      // Usamos uma higienização simples caso a função higenizarTextoSeguro não esteja no escopo
      const nomeSeguro =
        typeof higenizarTextoSeguro === "function"
          ? higenizarTextoSeguro(bairro.nome)
          : bairro.nome;

      const textoTaxa =
        bairro.taxa === 0 ? "Grátis" : `R$ ${bairro.taxa.toFixed(2)}`;

      // Guardamos o _id do Mongo no value e a taxa num atributo customizado 'data-taxa'
      opcoesHTML += `<option value="${bairro._id}" data-taxa="${bairro.taxa}">${nomeSeguro} - ${textoTaxa}</option>`;
    });

    selectBairro.innerHTML = opcoesHTML;
  } catch (error) {
    console.error("❌ Erro ao inicializar bairros da API:", error);
    selectBairro.innerHTML = `<option value="" disabled>Erro ao carregar bairros...</option>`;
    return; // Aborta o listener se a API falhar
  }

  // 🔥 PROTEÇÃO COMPLEMENTAR: Monitora a digitação do usuário em tempo real
  if (inputRua) {
    // Remove listeners antigos se a função for chamada mais de uma vez
    inputRua.removeEventListener("input", gerenciarDigitacaoRua);
    inputRua.addEventListener("input", gerenciarDigitacaoRua);
  }
}

/**
 * Isolamos a lógica do evento de input para manter o código limpo e assíncrono
 */
function gerenciarDigitacaoRua(e) {
  const selectBairro = document.getElementById("address-neighborhood");
  const valorAtual = e.target.value;
  const idBairro = selectBairro.value;

  // Se não tem bairro selecionado, o que ele digita é a própria rua pura
  if (idBairro === "") {
    e.target.setAttribute("data-rua-original", valorAtual);
    return;
  }

  // Busca o bairro correto no array global usando o ID do MongoDB
  const dadosBairro = listaBairrosDisponiveis.find((b) => b._id === idBairro);

  // Se ele apagar o texto todo manualmente com o bairro selecionado
  if (valorAtual === "") {
    e.target.setAttribute("data-rua-original", "");
    return;
  }

  // Se o texto digitado termina com o nome do bairro, isolamos a rua original
  if (dadosBairro && valorAtual.endsWith(dadosBairro.nome)) {
    let ruaIsolada = valorAtual.slice(0, -dadosBairro.nome.length);
    if (ruaIsolada.endsWith(", ")) ruaIsolada = ruaIsolada.slice(0, -2);
    else if (ruaIsolada.endsWith(",")) ruaIsolada = ruaIsolada.slice(0, -1);

    e.target.setAttribute("data-rua-original", ruaIsolada);
  } else {
    // Se ele quebrou a estrutura editando o meio do texto, consideramos o texto atual como a nova rua
    e.target.setAttribute("data-rua-original", valorAtual);
  }
}

// Executa assim que a página carregar
document.addEventListener("DOMContentLoaded", inicializarBairros);

// --- SELEÇÃO DE BAIRRO ---

// --- SELEÇÃO DE BAIRRO (VERSÃO API) ---

function selecionarTaxaPorBairro() {
  const selectBairro = document.getElementById("address-neighborhood");
  const infoText = document.getElementById("delivery-info");
  const inputRua = document.getElementById("order-address");

  if (!selectBairro || !inputRua) return;

  // Agora o valor é o _id do MongoDB (String) e não mais um índice numérico
  const idBairroSelecionado = selectBairro.value;

  // Se o "back-up" da rua original não existir no input, inicializa com o valor atual
  if (!inputRua.hasAttribute("data-rua-original")) {
    inputRua.setAttribute("data-rua-original", inputRua.value);
  }

  // Caso selecione a opção vazia/padrão (Limpar seleção)
  if (idBairroSelecionado === "") {
    taxaEntregaAtual = 0;
    if (infoText) infoText.innerText = "";

    // Restaura o que o usuário tinha digitado de rua e limpa o back-up
    inputRua.value = inputRua.getAttribute("data-rua-original") || "";
    inputRua.removeAttribute("data-rua-original");

    if (typeof renderCart === "function") renderCart();
    return;
  }

  // 🔥 MUDANÇA CHAVE: Busca o bairro na lista global usando o .find() pelo ID do banco
  const dadosBairro = listaBairrosDisponiveis.find(
    (b) => b._id === idBairroSelecionado,
  );

  if (dadosBairro) {
    // Garante que as suas funções de segurança continuem funcionando
    const taxaValidada =
      typeof validarTaxaSegura === "function"
        ? validarTaxaSegura(dadosBairro.taxa)
        : dadosBairro.taxa;
    const nomeSeguro =
      typeof higenizarTextoSeguro === "function"
        ? higenizarTextoSeguro(dadosBairro.nome)
        : dadosBairro.nome;

    taxaEntregaAtual = taxaValidada;

    // Exibição do texto informativo com a correção do IF/ELSE
    if (infoText) {
      if (taxaValidada === 0) {
        infoText.innerHTML = `🎉 Bairro: <b>${nomeSeguro}</b> | Taxa de Entrega: <b class="text-green-600">GRÁTIS (Aniversário do PratinhoPraTudo! 🎂)</b>`;
      } else {
        infoText.innerHTML = `🛵 Bairro: <b>${nomeSeguro}</b> | Taxa Fixa: <b class="text-red-600">R$ ${taxaValidada.toFixed(2)}</b>`;
      }
    }

    // Pega o texto puro da rua que está salvo no atributo oculto
    const ruaPura = (inputRua.getAttribute("data-rua-original") || "").trim();

    // Atualiza o valor visível do input: "Rua e Número, Bairro"
    if (ruaPura) {
      inputRua.value = `${ruaPura}, ${dadosBairro.nome}`;
    } else {
      inputRua.value = dadosBairro.nome;
    }

    // Recalcula o carrinho na tela
    if (typeof renderCart === "function") renderCart();
  }
}

// --- FUNÇÃO TOGGLE REESTRUTURADA (CORREÇÃO DO LOOP INFINITO) ---

function toggleAddressField() {
  const type = document.getElementById("order-type").value;

  const addrContainer = document.getElementById("order-address-container");
  const selectBairro = document.getElementById("address-neighborhood");
  const inputRua = document.getElementById("order-address");
  const infoText = document.getElementById("delivery-info");

  if (type === "DELIVERY") {
    if (addrContainer) addrContainer.style.display = "block";
  } else {
    if (addrContainer) addrContainer.style.display = "none";

    if (selectBairro) selectBairro.selectedIndex = 0;

    if (inputRua) {
      inputRua.value = "";
      inputRua.removeAttribute("data-rua-original"); // Remove o backup oculto
    }

    if (infoText) infoText.innerText = "";

    taxaEntregaAtual = 0;
    renderCart();
  }
}

function validarEstruturaEndereco(endereco) {
  // Esta Regex verifica se o texto tem: [Qualquer coisa] + [Vírgula] + [Número/S/N] + [Vírgula] + [Bairro]
  // Ela aceita números puros (123), blocos (Ap 402), ou "S/N" / "Sem Número"
  const regexEndereco =
    /^(.+),\s*([0-9]+|[0-9]+[a-zA-Z]*-?[0-9]*|s\/n|S\/N|sem número|Sem Número),\s*(.+)$/;

  return regexEndereco.test(endereco.trim());
}

document.addEventListener("DOMContentLoaded", () => {
  const paymentMethod = document.getElementById("payment-method");
  const changeContainer = document.getElementById("change-container");
  const changeInput = document.getElementById("change-amount");

  paymentMethod.addEventListener("change", (e) => {
    if (e.target.value === "DINHEIRO") {
      // Mostra o campo se for Dinheiro
      changeContainer.classList.remove("hidden");
    } else {
      // Esconde o campo e limpa o valor digitado se mudar de ideia
      changeContainer.classList.add("hidden");
      changeInput.value = "";
    }
  });
});

// ==========================================
// GLOBAIS DE CONTROLE DO CUPOM
// ==========================================
const API_BASE_COUPONS = "https://essenzaintimasapi.onrender.com/cupom"; // Ajuste se necessário
let appliedCouponCode = null;
let computedDiscount = 0;

// ==========================================
// 1. ATUALIZAR TOTAIS COM DESCONTO (VERSÃO CORRIGIDA E ÚNICA)
// ==========================================
// Substitua a antiga atualizarTotaisComDesconto por esta:
function atualizarTotaisComDesconto(discount = 0) {
  // Atualiza o estado global do desconto obtido
  computedDiscount = parseFloat(discount) || 0;

  const textSubtotal = document.getElementById("cart-subtotal")
    ? document.getElementById("cart-subtotal").innerText
    : "R$ 0,00";

  // Limpa string R$ para obter float puro
  const subtotal =
    parseFloat(textSubtotal.replace(",", ".").replace(/[^\d.]/g, "")) || 0;

  // Executa o cálculo completo injetando os valores na tela
  recalcularTotalGeralCompleto(subtotal);

  // 🔥 SOLUÇÃO VISUAL: Força a linha da taxa de entrega a exibir "Grátis"
  if (
    appliedCouponCode === "FRETEGRATIS" ||
    appliedCouponCode === "QUEROFRETE"
  ) {
    taxaEntregaAtual = 0; // Garante que a variável interna seja zerada

    // Buscamos o elemento que exibe a taxa no resumo (o seu "cart-shipping")
    const elementoTaxa = document.getElementById("cart-shipping");
    if (elementoTaxa) {
      elementoTaxa.innerText = "Grátis";
    }
  }
}
// ==========================================
// 2. VALIDAÇÃO DO CUPOM
// ==========================================
// ==========================================
// 2. VALIDAÇÃO DO CUPOM (VERSÃO COM UX MELHORADA)
// ==========================================
async function validateCoupon() {
  const phoneInput = document.getElementById("client-phone").value.trim();
  const couponInput = document.getElementById("coupon-code");
  const codeInput = couponInput.value.toUpperCase().trim();
  const textSubtotal = document.getElementById("cart-subtotal")
    ? document.getElementById("cart-subtotal").innerText
    : "R$ 0.00";

  // Extrai o valor do subtotal mantendo o ponto original do JS
  const currentSubtotal =
    parseFloat(textSubtotal.replace(",", ".").replace(/[^\d.]/g, "")) || 0;

  if (!phoneInput) {
    showCouponMessage(
      "Digite seu WhatsApp primeiro na seção 'Seus Dados'.",
      "error",
    );
    document.getElementById("client-phone").focus();
    return;
  }

  if (!codeInput) {
    showCouponMessage("Por favor, insira o código do cupom.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_COUPONS}/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: codeInput,
        purchaseValue: currentSubtotal,
        customerPhone: phoneInput,
      }),
    });

    const result = await response.json();

    if (response.ok && result.valid) {
      appliedCouponCode = result.code;
      computedDiscount = parseFloat(result.discountValue) || 0;

      // 🔥 NOVA REGRA: Se o código do cupom for de Frete Grátis
      if (
        appliedCouponCode === "FRETEGRATIS" ||
        appliedCouponCode === "QUEROFRETE"
      ) {
        taxaEntregaAtual = 0; // Zera a variável global da taxa de entrega
        computedDiscount = 0; // Zera o desconto em dinheiro para não acumular os dois

        // Atualiza visualmente o texto informativo do bairro (se houver)
        const infoText = document.getElementById("delivery-info");
        if (infoText) {
          infoText.innerHTML = `🛵 Cupom Aplicado: <b class="text-emerald-600">FRETE GRÁTIS ATIVADO!</b>`;
        }

        showCouponMessage(
          `Cupom de Frete Grátis aplicado com sucesso!`,
          "success",
        );
      } else {
        showCouponMessage(`Cupom ${result.code} aplicado!`, "success");
      }

      updateCouponUI(true, computedDiscount);
      atualizarTotaisComDesconto(computedDiscount);
    } else {
      // 💡 Se o backend recusar (ex: subtotal menor que o mínimo),
      // mostra o erro amigável retornado da API e preserva o texto no input
      showCouponMessage(
        result.error || "Cupom inválido para esta compra.",
        "error",
      );

      // Reseta os estados globais de desconto sem limpar o campo de texto
      appliedCouponCode = null;
      computedDiscount = 0;

      // Mantém a UI em modo "erro" (não bloqueia o input e não esconde o botão aplicar)
      updateCouponUI(false, 0);
      atualizarTotaisComDesconto(0);
    }
  } catch (error) {
    console.error("Erro na requisição do cupom:", error);
    showCouponMessage("Erro de conexão ao validar o cupom.", "error");
  }
}

// ==========================================
// 3. REMOÇÃO DO CUPOM
// ==========================================
function removeCoupon() {
  appliedCouponCode = null;
  computedDiscount = 0;
  document.getElementById("coupon-code").value = "";

  updateCouponUI(false, 0);
  hideCouponMessage();

  // 🔄 Restaura a taxa de entrega original chamando a função do bairro novamente
  const selectBairro = document.getElementById("address-neighborhood");
  if (selectBairro && selectBairro.value !== "") {
    selecionarTaxaPorBairro(); // Recalcula a taxa real do bairro dele
  } else {
    taxaEntregaAtual = 0;
    if (typeof renderCart === "function") renderCart();
  }

  // Recalcula os totais zerando o desconto do cupom
  atualizarTotaisComDesconto(0);
}

// ==========================================
// 4. SEGURANÇA SE MUDAR O WHATSAPP
// ==========================================
function resetCouponState() {
  if (appliedCouponCode) {
    removeCoupon();
    showCouponMessage(
      "WhatsApp alterado! Valide o cupom novamente.",
      "warning",
    );
  }
}

// ==========================================
// 5. PROCESSO DE CHECKOUT COM INTEGRAÇÃO (VERSÃO ATUALIZADA)
// ==========================================
async function processCheckout() {
  const phoneInput = document.getElementById("client-phone").value.trim();

  // 1. Captura o subtotal atual da tela para enviar como o valor bruto do pedido (orderValue)
  const textSubtotal = document.getElementById("cart-subtotal")
    ? document.getElementById("cart-subtotal").innerText
    : "R$ 0,00";
  const currentSubtotal =
    parseFloat(textSubtotal.replace(",", ".").replace(/[^\d.]/g, "")) || 0;

  if (appliedCouponCode) {
    try {
      // 2. Faz a requisição enviando as métricas financeiras exatamente como o backend espera
      const response = await fetch(`${API_BASE_COUPONS}/coupons/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: appliedCouponCode,
          customerPhone: phoneInput,
          orderValue: currentSubtotal, // 💰 Valor bruto enviado ao backend
          discountApplied: computedDiscount, // 💸 Desconto aplicado enviado ao backend
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(
          "Erro com o cupom: " +
            (err.error || "Não foi possível aplicar o cupom."),
        );
        return;
      }
    } catch (e) {
      console.error("Erro ao aplicar cupom no checkout:", e);
      alert("Erro de conexão ao processar o cupom.");
      return;
    }
  }

  // Se passou pela aplicação do cupom (ou se não tinha cupom), segue para o checkout final
  if (typeof checkout === "function") {
    checkout();
  } else {
    alert("Pedido finalizado com sucesso!");
  }
}

// ==========================================
// INTERFACE E RENDER DO CARRINHO
// ==========================================
function updateCouponUI(hasCoupon, discountValue) {
  const input = document.getElementById("coupon-code");
  const icon = document.getElementById("coupon-success-icon");
  const btnApply = document.getElementById("btn-apply-coupon");
  const btnRemove = document.getElementById("btn-remove-coupon");
  const rowDiscount = document.getElementById("row-discount");
  const displayDiscount = document.getElementById("cart-discount");

  if (hasCoupon) {
    input.disabled = true;
    input.classList.add(
      "bg-emerald-50",
      "border-emerald-300",
      "text-emerald-800",
      "font-bold",
    );
    if (icon) icon.classList.remove("hidden");
    if (btnApply) btnApply.classList.add("hidden");
    if (btnRemove) btnRemove.classList.remove("hidden");
    if (rowDiscount) rowDiscount.classList.remove("hidden");
    if (displayDiscount)
      displayDiscount.innerText = `- R$ ${discountValue.toFixed(2).replace(".", ",")}`;
  } else {
    input.disabled = false;
    input.classList.remove(
      "bg-emerald-50",
      "border-emerald-300",
      "text-emerald-800",
      "font-bold",
    );
    if (icon) icon.classList.add("hidden");
    if (btnApply) btnApply.classList.remove("hidden");
    if (btnRemove) btnRemove.classList.add("hidden");
    if (rowDiscount) rowDiscount.classList.add("hidden");
  }
}

function showCouponMessage(text, type) {
  const msg = document.getElementById("coupon-message");
  if (!msg) return;
  msg.innerText = text;
  msg.classList.remove(
    "hidden",
    "text-red-500",
    "text-emerald-600",
    "text-amber-500",
  );

  if (type === "error") msg.classList.add("text-red-500");
  if (type === "success") msg.classList.add("text-emerald-600");
  if (type === "warning") msg.classList.add("text-amber-500");
}

function hideCouponMessage() {
  const msg = document.getElementById("coupon-message");
  if (msg) msg.classList.add("hidden");
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.cartId !== id);
  if (cart.length === 0) {
    localStorage.removeItem("cart");
  } else {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  if (typeof updateCartBadge === "function") updateCartBadge();
  renderCart();
}

// ==========================================
// MODAL DE CUPONS DISPONÍVEIS
// ==========================================
async function openAvailableCouponsModal() {
  const listContainer = document.getElementById("available-coupons-list");
  document.getElementById("modal-available-coupons").classList.remove("hidden");

  listContainer.innerHTML = `
    <div class="text-center py-6 text-gray-400">
      <i class="fas fa-spinner fa-spin text-xl mb-2 block"></i> Buscando os melhores descontos...
    </div>`;

  try {
    const response = await fetch(`${API_BASE_COUPONS}/admin/coupons`);
    if (!response.ok) throw new Error();

    const coupons = await response.json();

    const activeCoupons = coupons.filter((c) => {
      const isExpired = new Date() > new Date(c.expirationDate);
      return c.isActive && !isExpired;
    });

    if (activeCoupons.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-6 text-gray-500 text-sm">
          <i class="fa-solid fa-face-frown text-xl text-gray-300 mb-2 block"></i> Nenhum cupom ativo disponível no momento.
        </div>`;
      return;
    }

    listContainer.innerHTML = "";
    activeCoupons.forEach((coupon) => {
      const labelDesconto =
        coupon.type === "percentage"
          ? `${coupon.value}% OFF`
          : `R$ ${coupon.value.toFixed(2).replace(".", ",")} de Desconto`;
      const regraMinimo =
        coupon.minPurchaseValue > 0
          ? `Válido para compras acima de R$ ${coupon.minPurchaseValue.toFixed(2).replace(".", ",")}`
          : "Sem valor mínimo de compra";
      const regraLimite =
        coupon.limitPerPhone > 1
          ? `Limite de ${coupon.limitPerPhone} usos por WhatsApp`
          : "Válido para 1 uso por WhatsApp";

      const div = document.createElement("div");
      div.className =
        "bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between gap-3 hover:border-red-100 transition-colors";
      div.innerHTML = `
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="bg-red-50 text-[#ea1d2c] font-mono font-black text-xs px-2.5 py-1 rounded-lg border border-red-100 tracking-wider">
              ${coupon.code}
            </span>
            <span class="text-xs font-bold text-gray-900">${labelDesconto}</span>
          </div>
          <p class="text-[11px] text-gray-500 font-medium">${regraMinimo} • ${regraLimite}</p>
        </div>
        <button type="button" onclick="selectCouponFromModal('${coupon.code}')" class="bg-[#ea1d2c] hover:bg-[#d91a29] text-white text-[11px] font-bold px-3 py-2 rounded-xl transition active:scale-95 shadow-sm">
          Pegar
        </button>`;
      listContainer.appendChild(div);
    });
  } catch (error) {
    listContainer.innerHTML = `
      <div class="text-center py-6 text-red-500 text-xs font-semibold">
        <i class="fas fa-exclamation-triangle text-lg mb-1 block"></i> Erro ao carregar cupons.
      </div>`;
  }
}

function closeAvailableCouponsModal() {
  document.getElementById("modal-available-coupons").classList.add("hidden");
}

function selectCouponFromModal(code) {
  document.getElementById("coupon-code").value = code;
  closeAvailableCouponsModal();
  validateCoupon();
}

// ==========================================
// REVALIDAÇÃO AUTOMÁTICA DO CUPOM AO ALTERAR O CARRINHO
// ==========================================
// ==========================================
// REVALIDAÇÃO AUTOMÁTICA DO CUPOM AO ALTERAR O CARRINHO (CORRIGIDA)
// ==========================================
async function revalidarCupomAtivo(novoSubtotal) {
  // Se não tem cupom aplicado, não precisa fazer nada
  if (!appliedCouponCode) return;

  const phoneInput = document.getElementById("client-phone").value.trim();

  // Se o usuário tirou itens e o carrinho ficou zerado, remove o cupom direto
  if (novoSubtotal === 0) {
    removeCoupon();
    return;
  }

  try {
    const response = await fetch(`${API_BASE_COUPONS}/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: appliedCouponCode,
        purchaseValue: novoSubtotal,
        customerPhone: phoneInput || "00000000000",
      }),
    });

    const result = await response.json();

    // Se a API disser que NÃO é mais válido
    if (!response.ok || !result.valid) {
      removeCoupon(); // Limpa as variáveis globais e esconde a linha de desconto

      // TRATAMENTO DE ERRO SEGURO:
      // 1. Prioriza a mensagem amigável que a própria API já devolve (ex: result.error)
      // 2. Se a API mandar o valor numérico em outro formato (ex: result.minValue), trata aqui
      // 3. Se tudo falhar, usa um texto genérico elegante.
      let mensagemErro =
        "Cupom removido: o valor mínimo da compra não foi atingido.";

      if (result.error) {
        mensagemErro = result.error; // Usa o texto exato do seu backend (Ex: "Subtotal menor que o mínimo de R$ 50,00")
      } else if (result.minPurchaseValue) {
        mensagemErro = `Cupom removido: o valor mínimo desta compra é R$ ${parseFloat(result.minPurchaseValue).toFixed(2).replace(".", ",")}`;
      }

      showCouponMessage(mensagemErro, "error");
    } else {
      // Se continuar válido, garante que o desconto está atualizado no estado global
      computedDiscount = parseFloat(result.discountValue) || 0;
      updateCouponUI(true, computedDiscount);
    }
  } catch (error) {
    console.error("Erro ao revalidar cupom automaticamente:", error);
  }
}

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const menuOverlay = document.getElementById("menuOverlay");
const closeMenu = document.getElementById("closeMenu");


function abrirMenuMobile() {

    mobileMenu.classList.remove("-translate-x-full");

    menuOverlay.classList.remove("hidden");

    setTimeout(() => {
        menuOverlay.classList.remove("opacity-0");
    }, 10);

    document.body.classList.add("overflow-hidden");
}


function fecharMenuMobile() {

    mobileMenu.classList.add("-translate-x-full");

    menuOverlay.classList.add("opacity-0");

    setTimeout(() => {
        menuOverlay.classList.add("hidden");
    }, 300);

    document.body.classList.remove("overflow-hidden");
}


menuToggle.addEventListener("click", abrirMenuMobile);

closeMenu.addEventListener("click", fecharMenuMobile);

menuOverlay.addEventListener("click", fecharMenuMobile);

document.addEventListener("DOMContentLoaded", () => {

  const btnBuscar = document.getElementById("btn-buscar");
  const searchBox = document.getElementById("search-box");
  const inputBusca = document.getElementById("input-busca");
  const btnFechar = document.getElementById("btn-fechar-busca");
  const resultados = document.getElementById("resultados-busca");


  // ============================================================
  // ABRIR BUSCA
  // ============================================================

  btnBuscar.addEventListener("click", () => {

    searchBox.classList.remove("hidden");

    setTimeout(() => {
      inputBusca.focus();
    }, 100);

  });


  // ============================================================
  // FECHAR BUSCA
  // ============================================================

  btnFechar.addEventListener("click", () => {

    fecharBusca();

  });


  function fecharBusca() {

    searchBox.classList.add("hidden");

    inputBusca.value = "";

    resultados.innerHTML = "";

    resultados.classList.add("hidden");

    removerDestaques();

  }


  // ============================================================
  // PESQUISAR
  // ============================================================

  inputBusca.addEventListener("input", () => {

    const termo = inputBusca.value.trim().toLowerCase();

    removerDestaques();

    if (!termo) {

      resultados.innerHTML = "";

      resultados.classList.add("hidden");

      return;

    }


    const elementos = encontrarElementos(termo);

    mostrarResultados(elementos, termo);

  });


  // ============================================================
  // ENCONTRAR ELEMENTOS
  // ============================================================

  function encontrarElementos(termo) {

    const elementos = document.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, span, a, button, li, label"
    );

    const encontrados = [];

    elementos.forEach(elemento => {

      const texto = elemento.textContent.trim();

      if (!texto) return;

      if (
        texto.toLowerCase().includes(termo)
      ) {

        // Evita pegar elementos duplicados
        // que estejam dentro de outro resultado
        const jaEncontrado = encontrados.some(
          item => item.contains(elemento)
        );

        if (!jaEncontrado) {

          encontrados.push(elemento);

        }

      }

    });

    return encontrados.slice(0, 8);

  }


  // ============================================================
  // MOSTRAR RESULTADOS
  // ============================================================

  function mostrarResultados(elementos, termo) {

    resultados.innerHTML = "";

    if (elementos.length === 0) {

      resultados.innerHTML = `
        <div class="px-3 py-4 text-center">

          <div class="text-2xl mb-2">
            🔎
          </div>

          <p class="text-sm text-gray-500">
            Nenhum resultado encontrado
          </p>

          <p class="text-xs text-gray-400 mt-1">
            Tente pesquisar outro termo
          </p>

        </div>
      `;

      resultados.classList.remove("hidden");

      return;

    }


    elementos.forEach((elemento, index) => {

      const item = document.createElement("button");

      item.type = "button";

      item.className = `
        w-full text-left
        px-3 py-3
        rounded-xl
        hover:bg-[#F8F3EF]
        transition-colors
        border-b border-[#F1E9E4]
        last:border-0
      `;


      const textoOriginal = elemento.textContent.trim();

      const texto =
        textoOriginal.length > 70
          ? textoOriginal.substring(0, 70) + "..."
          : textoOriginal;


      item.innerHTML = `
        <div class="flex items-center gap-3">

          <div class="
            w-9 h-9
            rounded-full
            bg-[#F8F3EF]
            flex items-center justify-center
            shrink-0
          ">

            <svg
              class="w-4 h-4 text-[#9E7960]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="7"/>
              <path d="m20 20-4-4" stroke-linecap="round"/>
            </svg>

          </div>

          <div class="min-w-0">

            <p class="text-sm font-medium text-[#26211E] truncate">
              ${texto}
            </p>

            <p class="text-xs text-gray-400 mt-0.5">
              Resultado ${index + 1}
            </p>

          </div>

        </div>
      `;


      item.addEventListener("click", () => {

        irParaElemento(elemento);

      });


      resultados.appendChild(item);

    });


    resultados.classList.remove("hidden");

  }


  // ============================================================
  // IR ATÉ O ELEMENTO
  // ============================================================

  function irParaElemento(elemento) {

    searchBox.classList.add("hidden");

    resultados.classList.add("hidden");

    inputBusca.blur();


    elemento.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });


    elemento.classList.add("resultado-busca");


    setTimeout(() => {

      elemento.classList.remove("resultado-busca");

    }, 2500);

  }


  // ============================================================
  // REMOVER DESTAQUES
  // ============================================================

  function removerDestaques() {

    document
      .querySelectorAll(".resultado-busca")
      .forEach(elemento => {

        elemento.classList.remove("resultado-busca");

      });

  }


  // ============================================================
  // ESC - FECHAR
  // ============================================================

  document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

      fecharBusca();

    }

  });


  // ============================================================
  // CLIQUE FORA - FECHAR
  // ============================================================

  document.addEventListener("click", (event) => {

    if (
      !searchBox.contains(event.target) &&
      !btnBuscar.contains(event.target)
    ) {

      fecharBusca();

    }

  });

});
