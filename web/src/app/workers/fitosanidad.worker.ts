// /// <reference lib="webworker" />

// function getFitosanidadGraph(state, params) {
//   const days = state.reduce((a, b) => {
//     const date = new Date(b.fecha.replace(/-/g, '\/'));
//     return Object.assign(a, { [date.toLocaleDateString()]: 1 });
//   }, {});
//   // TODO: Obtener data por fecha...;
//   const points = state.reduce((a, b) => {
//     const key = b.concepto_agricola + ' ' + '-' + ' ' + b.subconcepto_agricola;
//     const obj = a[key];

//     // console.log('este', b.concepto_agricola);
//     return Object.assign(a, {
//       [key]: {
//         ...obj,
//         valor_encontrado: (obj?.valor_encontrado ?? []).concat({ x: new Date(b.fecha.replace(/-/g, '\/')).toLocaleDateString(), y: b.valor_encontrado })
//       },
//     });
//   }, {});

//   return { days: Object.keys(days), points };
// }

// // new Date(b.fecha).toLocaleDateString()
// addEventListener('message', ({ data }) => {

//   const { action, state, params } = data;
//   switch (action) {

//     case 'GRAPH':
//       postMessage(getFitosanidadGraph(state ?? [], params));
//       break;
//   }

// });
