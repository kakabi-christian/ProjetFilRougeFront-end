// src/Contents/PaiementContent.jsx
import React, { useState, useEffect } from "react";
import { getActiveConcours } from "../services/concoursService";
import {
  createPaiement,
  checkPaiementStatus,
} from "../services/paiementService";
import { generatePDF } from "../services/pdfService";
import LogoMTN from "../Assets/logo-mtn.jpg";
import LogoOrange from "../Assets/logo-orange.jpg";
import { Link } from "react-router-dom";

const colorGreen = "#25963F";
const colorBlue = "#1E90FF";

export default function PaiementContent() {
  const [concours, setConcours] = useState([]);
  const [selectedConcours, setSelectedConcours] = useState("");
  const [nomComplet, setNomComplet] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [modePaiement, setModePaiement] = useState("");
  const [paiement, setPaiement] = useState(null);
  const [recu, setRecu] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // 1. Charger les concours au démarrage
  useEffect(() => {
    console.log("[PaiementContent] Chargement des concours actifs...");
    getActiveConcours()
      .then((response) => {
        const dataArray = response.data?.data || response.data || [];
        setConcours(Array.isArray(dataArray) ? dataArray : []);
        console.log(
          "[PaiementContent] Concours chargés avec succès:",
          dataArray.length
        );
      })
      .catch((err) => {
        console.error("[PaiementContent] Erreur récupération concours:", err);
        setConcours([]);
      });
  }, []);

  // 2. Gérer la soumission du paiement
  const handlePaiementSubmit = async (e) => {
    e.preventDefault();
    console.log(
      "[PaiementContent] Formulaire soumis. Préparation des données..."
    );

    if (!selectedConcours || !modePaiement) {
      alert("Veuillez sélectionner un concours et un mode de paiement");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Initialisation de la transaction...");

    const paiementData = {
      nomComplet,
      prenom,
      email,
      telephone,
      concoursId: selectedConcours,
      modePaiement,
    };

    console.log(
      "[PaiementContent] Envoi demande paiement au backend:",
      paiementData
    );

    try {
      // ÉTAPE A : Déclencher le paiement via Campay
      const result = await createPaiement(paiementData);
      const { externalReference } = result;
      console.log(
        "[PaiementContent] Paiement initié. Référence reçue:",
        externalReference
      );

      setStatusMessage(
        "En attente de validation sur votre mobile (Tapez votre code PIN)..."
      );

      // ÉTAPE B : Lancer le Polling pour vérifier quand le Webhook aura validé le paiement
      console.log(
        "[PaiementContent] Démarrage du polling (vérification toutes les 3s)..."
      );

      const pollInterval = setInterval(async () => {
        try {
          console.log(
            `[Polling] Vérification du statut pour ${externalReference}...`
          );
          const statusUpdate = await checkPaiementStatus(externalReference);

          if (statusUpdate.status === "SUCCESSFUL") {
            console.log(
              "[PaiementContent] ✅ Paiement validé ! Récupération du reçu."
            );
            clearInterval(pollInterval);

            // On stocke les données pour l'affichage final
            setPaiement(statusUpdate.recu.paiement);
            setRecu(statusUpdate.recu);
            setIsProcessing(false);
          } else {
            console.log(
              "[Polling] Toujours en attente de paiement (PENDING)..."
            );
          }
        } catch (err) {
          console.error(
            "[Polling] Erreur lors de la vérification:",
            err.message
          );
        }
      }, 3000);

      // Sécurité : Arrêt automatique après 2 minutes (120s)
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isProcessing) {
          console.warn("[PaiementContent] 🛑 Timeout atteint (2min).");
          setIsProcessing(false);
          alert(
            "Le délai d'attente est dépassé. Si vous avez été débité, utilisez l'option 'Reçu oublié'."
          );
        }
      }, 120000);
    } catch (error) {
      console.error("[PaiementContent] Erreur lors de l'initiation:", error);
      setIsProcessing(false);
      alert(
        error.response?.data?.message ||
          "Une erreur est survenue lors de la connexion au service de paiement."
      );
    }
  };

  // 3. Écran de chargement (Pendant le traitement ou le polling)
  if (isProcessing) {
    return (
      <div
        className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center"
        style={{ height: "60vh" }}
      >
        <div
          className="spinner-grow text-success mb-4"
          style={{ width: "4rem", height: "4rem" }}
          role="status"
        ></div>
        <h3 className="fw-bold" style={{ color: colorGreen }}>
          {statusMessage}
        </h3>
        <p className="text-muted px-3">
          Ne fermez pas cette page. Une notification a été envoyée sur le numéro{" "}
          <strong>{telephone}</strong>.
        </p>
        <div className="alert alert-info mt-3 mx-2">
          <strong>Info :</strong> Une fois votre code secret saisi sur votre
          téléphone, ce message disparaîtra automatiquement.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2
        className="mb-4 fw-bold text-uppercase text-center"
        style={{ color: colorGreen }}
      >
        Paiement des frais de concours
      </h2>

      {!recu ? (
        <form
          onSubmit={handlePaiementSubmit}
          className="shadow-lg p-4 border-0 rounded-4 bg-white mx-auto"
          style={{ maxWidth: "800px" }}
        >
          <div className="mb-4">
            <label className="form-label fw-bold">
              1. Choisir le concours :
            </label>
            <select
              className="form-select form-select-lg border-2"
              value={selectedConcours}
              onChange={(e) => setSelectedConcours(e.target.value)}
              required
              style={{ borderColor: colorGreen }}
            >
              <option value="">-- Sélectionnez un concours --</option>
              {concours.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.intitule} - {c.montant?.toLocaleString()} FCFA
                </option>
              ))}
            </select>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Nom</label>
              <input
                className="form-control"
                value={nomComplet}
                onChange={(e) => setNomComplet(e.target.value)}
                required
                placeholder="Votre nom"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Prénom</label>
              <input
                className="form-control"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
                placeholder="Votre prénom"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">
                Email (pour recevoir le reçu)
              </label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="exemple@mail.com"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">
                Téléphone Mobile Money
              </label>

              <div className="input-group">
  <input
    type="tel"
    className="form-control"
    value={telephone}
    onChange={(e) => {
      let value = e.target.value.replace(/\D/g, "");

      // Forcer le préfixe 237
      if (!value.startsWith("237")) {
        value = "237" + value.replace(/^237/, "");
      }

      // Limiter à +237 + 9 chiffres
      value = value.slice(0, 12);

      setTelephone("+" + value);
    }}
    required
    placeholder="+2376XXXXXXXX"
  />
</div>

            </div>
          </div>

          <div className="mb-4 text-center">
            <label className="form-label fw-bold d-block mb-3">
              2. Choisir le mode de paiement :
            </label>
            <div className="d-flex gap-4 justify-content-center border p-4 rounded-3 bg-light">
              <label className="text-center" style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  name="modePaiement"
                  value="MTN_MOMO"
                  checked={modePaiement === "MTN_MOMO"}
                  onChange={(e) => setModePaiement(e.target.value)}
                  required
                  className="d-block mx-auto mb-2"
                />
                <img
                  src={LogoMTN}
                  alt="MTN"
                  width={70}
                  className="rounded shadow-sm"
                />
                <div className="small fw-bold mt-1">MTN</div>
              </label>
              <label className="text-center" style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  name="modePaiement"
                  value="ORANGE_MONEY"
                  checked={modePaiement === "ORANGE_MONEY"}
                  onChange={(e) => setModePaiement(e.target.value)}
                  required
                  className="d-block mx-auto mb-2"
                />
                <img
                  src={LogoOrange}
                  alt="Orange"
                  width={70}
                  className="rounded shadow-sm"
                />
                <div className="small fw-bold mt-1">ORANGE</div>
              </label>
            </div>
          </div>

          <div className="d-grid gap-2">
            <button
              className="btn btn-success btn-lg fw-bold shadow-sm"
              type="submit"
              style={{ backgroundColor: colorGreen }}
            >
              PROCÉDER AU PAIEMENT
            </button>
            <Link
              to="/ForgotRecu"
              className="btn btn-link text-decoration-none text-danger mt-2"
            >
              J'ai déjà effectué un paiement sans avoir mon reçu
            </Link>
          </div>
        </form>
      ) : (
        // --- AFFICHAGE DU REÇU APRÈS SUCCÈS ---
        <div
          className="card shadow-lg border-0 rounded-4 overflow-hidden mx-auto"
          style={{ maxWidth: "700px" }}
        >
          <div
            className="p-4 text-center text-white"
            style={{ backgroundColor: colorGreen }}
          >
            <h3 className="m-0 fw-bold">Paiement Terminé !</h3>
            <p className="m-0 opacity-75">Votre reçu de paiement est prêt.</p>
          </div>
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-md-7">
                <h5 className="text-muted text-uppercase small fw-bold mb-3 border-bottom pb-2">
                  Informations Candidat
                </h5>
                <p className="mb-1">
                  <strong>N° Reçu :</strong>{" "}
                  <span className="text-primary fw-bold fs-5">
                    {recu.numeroRecu}
                  </span>
                </p>
                <p className="mb-1">
                  <strong>Candidat :</strong> {nomComplet} {prenom}
                </p>
                <p className="mb-1">
                  <strong>Montant :</strong> {recu.montant?.toLocaleString()}{" "}
                  FCFA
                </p>
                <p className="mb-1">
                  <strong>Email :</strong> {email}
                </p>
              </div>
              <div className="col-md-5 text-center">
                {recu.qrCode && (
                  <div className="p-2 border rounded bg-white shadow-sm">
                    <img
                      src={recu.qrCode}
                      alt="QR Code Reçu"
                      width="100%"
                      style={{ maxWidth: "160px" }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="alert alert-warning mt-4 small">
              <strong>Attention :</strong> Conservez précieusement ce numéro de
              reçu. Il sera obligatoire pour votre inscription finale.
            </div>
            <button
              className="btn btn-primary w-100 btn-lg shadow fw-bold"
              onClick={() => {
                console.log("[PaiementContent] Génération du PDF...");
                generatePDF({ paiement, recu });
              }}
            >
              📥 TÉLÉCHARGER LE REÇU (PDF)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
