import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

type Equipment = {
  id?: string;
  nome: string;
  tamanho: string;
  quantidade: number;
};

export default function Inventory() {
  const [nome, setNome] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [equipamentos, setEquipamentos] = useState<Equipment[]>([]);

  const equipamentosCollection = collection(db, "equipamentos");

  // Adicionar equipamento
  const addEquipment = async () => {
    if (!nome || !tamanho) return;
    await addDoc(equipamentosCollection, { nome, tamanho, quantidade });
    setNome("");
    setTamanho("");
    setQuantidade(1);
    fetchEquipments();
  };

  // Ler equipamentos
  const fetchEquipments = async () => {
    const snapshot = await getDocs(equipamentosCollection);
    const items: Equipment[] = [];
    snapshot.forEach((doc) => items.push({ id: doc.id, ...(doc.data() as Equipment) }));
    setEquipamentos(items);
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Inventário</h1>

      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Tamanho"
          value={tamanho}
          onChange={(e) => setTamanho(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="number"
          placeholder="Quantidade"
          value={quantidade}
          onChange={(e) => setQuantidade(parseInt(e.target.value))}
          className="border p-2 w-full"
        />
        <button
          onClick={addEquipment}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Adicionar
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Equipamentos</h2>
      <ul className="space-y-1">
        {equipamentos.map((eq) => (
          <li key={eq.id} className="border p-2 rounded">
            {eq.nome} - {eq.tamanho} - {eq.quantidade}
          </li>
        ))}
      </ul>
    </div>
  );
}
