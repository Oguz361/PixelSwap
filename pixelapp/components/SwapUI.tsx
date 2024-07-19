import React from "react";
import styles from "../styles/Home.module.css";

// Definiert die Typen für die Eigenschaften (Props), die an die Komponente übergeben werden
type Props = {
    type: "native" | "token"; // Gibt den Typ des Tokens an
    tokenSymbol?: string; // Symbol des Tokens
    tokenBalance?: string; // Balance des Tokens
    current: string; // Der aktuelle Typ des Tokens, der verwendet wird
    setValue: (value: string) => void; // Funktion zum Setzen des Wertes
    max?: string; // Maximaler Wert, der gesetzt werden kann
    value: string; // Der aktuelle Wert im Input-Feld
};

// Definiert die SwapInput-Komponente
export default function SwapInput({
    type,
    tokenSymbol,
    tokenBalance,
    setValue,
    value,
    current,
    max,
}: Props) {
    // Funktion zum Kürzen des Token-Balance-Wertes auf maximal 5 Zeichen
    const truncate = (value: string) => {
        if (value === undefined) return; // Wenn der Wert undefiniert ist, nichts zurückgeben
        if (value.length > 5) {
            return value.slice(0, 5); // Kürzt den Wert auf die ersten 5 Zeichen
        }
        return value; // Gibt den ursprünglichen Wert zurück, wenn er 5 oder weniger Zeichen hat
    };

    return (
        <div className={styles.swapInputContainer}>
            {/* Input-Feld für die Eingabe des Token-Wertes */}
            <input 
                type="number"
                placeholder="0"
                value={value}
                onChange={(e) => setValue(e.target.value)} // Aktualisiert den Wert bei Eingabe
                disabled={current !== type} // Deaktiviert das Feld, wenn der aktuelle Typ nicht übereinstimmt
                className={styles.swapInput}
            /> 
            {/* Container für Token-Informationen und den Max-Button */}
            <div style={{
                position: "absolute",
                top: "10px",
                right: "10px",
            }}>
                {/* Anzeige des Token-Symbols */}
                <p style={{
                    fontSize: "12px",
                    marginBottom: "-5px",
                }}>{tokenSymbol}</p>
                {/* Anzeige der gekürzten Token-Balance */}
                <p style={{
                    fontSize: "10px",
                }}>Balance: {truncate(tokenBalance as string)}</p>
                {/* Button zum Setzen des maximalen Wertes, nur angezeigt wenn der aktuelle Typ übereinstimmt */}
                {current === type && (
                    <button
                        onClick={() => setValue(max || "0")}
                        className={styles.maxButton}
                    >Max</button>
                )}
            </div>
        </div>
    )
}
