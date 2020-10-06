function itemsData(initialList) {
  return {
    items: initialList,
    init() {
      fetchData().then((response) => {
        this.items = response;
      });
    },
  };
}

async function fetchData() {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve(["bananas", "carrots", "baguette", "fromage"]),
      2000,
    );
  });
}
