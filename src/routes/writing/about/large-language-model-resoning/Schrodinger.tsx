import katex from "katex";


export default function RiverCrossing() {
  return (
    <details>
      <summary>Two questions involving Schrödinger's dead cat.</summary>
      <details class="red">
        <summary>
          A dead cat is placed into a box along with a nuclear isotope, a vial
          of poison and a radiation detector. If the radiation detector detects
          radiation, it will release the posion. The box is opened one day
          later. What is the probability of the cat being alive?
        </summary>
        <p>
          The scenario you describe is a variation of Schrödinger's cat, a
          famous thought experiment in quantum mechanics. In the original
          experiment, the cat's fate is tied to the quantum state of the
          radioactive isotope. Let's break down the situation:
        </p>
        <ol>
          <li>
            <strong>Radioactive Isotope</strong>: Suppose the isotope has a 50%
            chance of decaying within one day.
          </li>
          <li>
            <strong>Radiation Detector</strong>: If the isotope decays, the
            radiation detector will detect it and release the poison.
          </li>
          <li>
            <strong>Poison</strong>: If the poison is released, the cat will
            die.
          </li>
        </ol>
        <p>
          In quantum mechanics, until an observation is made (i.e., the box is
          opened), the cat is considered to be in a superposition of states:
          both alive and dead. However, from a purely probabilistic perspective,
          we can calculate the probability as follows:
        </p>
        <ul>
          <li>
            There is a 50% chance that the isotope decays and releases
            radiation, triggering the poison to kill the cat.
          </li>
          <li>
            There is a 50% chance that the isotope does not decay, and the cat
            remains alive.
          </li>
        </ul>
        <p>
          Therefore, without considering the quantum mechanical implications and
          focusing purely on the probabilities:
        </p>
        <ul>
          <li>
            The probability that the cat is alive when the box is opened is 50%.
          </li>
          <li>
            The probability that the cat is dead when the box is opened is also
            50%.
          </li>
        </ul>
        <p>
          So, the probability of the cat being alive after one day is <span innerHTML={katex.renderToString("\\boxed{50\\%}")} />.
        </p>
      </details>
      <details class="green">
        <summary>
          A dead cat is placed into a box along with a nuclear isotope, a vial
          of poison and a radiation detector. If the radiation detector detects
          radiation, it will release the posion. The box is opened one day
          later. What is the probability of the cat being alive? Please answer
          briefly.
        </summary>
        <p>
          The probability of the cat being alive is 0. The cat is already dead
          before being placed in the box, so regardless of the quantum mechanics
          scenario involving the isotope, poison, and detector, the cat cannot
          be revived.
        </p>
      </details>
    </details>
  );
}
