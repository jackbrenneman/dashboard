"use client";

import Panel from "@/components/Panel";
import FoodLog from "@/components/panels/FoodLog";

type SolidsPanelProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export default function SolidsPanel({ collapsed, onToggleCollapse }: SolidsPanelProps) {
  return (
    <Panel
      id="panel-solids"
      title="Solids"
      wide
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
    >
      <p className="solids-sub">
        General guidance below — links go to the original source so you can
        confirm anything against your pediatrician&apos;s advice.
      </p>
      <div className="solids-layout">
        <div className="solids-info">
          <div className="solids-block">
            <h4>Good first foods</h4>
            <ul>
              <li>
                Iron-fortified infant cereal, or iron-rich purees (meat,
                poultry, beans, lentils)
              </li>
              <li>
                Mashed or pureed fruits and veggies — avocado, banana, sweet
                potato, squash
              </li>
              <li>Plain yogurt or well-cooked egg</li>
            </ul>
            <a
              className="source-link"
              href="https://www.healthychildren.org/English/ages-stages/baby/feeding-nutrition/Pages/starting-solid-foods.aspx"
              target="_blank"
              rel="noopener"
            >
              Source: HealthyChildren.org (AAP) →
            </a>
          </div>

          <div className="solids-block">
            <h4>Skip until age 1</h4>
            <ul>
              <li>Honey, or anything made with it — botulism risk</li>
              <li>Cow&apos;s milk as a drink (cheese/yogurt are fine)</li>
              <li>Added salt or sugar</li>
              <li>Unpasteurized foods and juices</li>
            </ul>
            <a
              className="source-link"
              href="https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/foods-and-drinks-to-avoid-or-limit.html"
              target="_blank"
              rel="noopener"
            >
              Source: CDC →
            </a>
          </div>

          <div className="solids-block">
            <h4>Choking hazards to watch for</h4>
            <ul>
              <li>Whole grapes, cherry tomatoes, or cherries — quarter them</li>
              <li>Thick nut butter — thin it out instead of serving it plain</li>
              <li>
                Popcorn, hard candy, whole nuts, large chunks of meat or
                cheese
              </li>
            </ul>
            <a
              className="source-link"
              href="https://solidstarts.com/choking-hazards-babies/"
              target="_blank"
              rel="noopener"
            >
              Source: Solid Starts →
            </a>
          </div>

          <div className="solids-block">
            <h4>Introducing allergens</h4>
            <ul>
              <li>
                Common allergens (peanut, egg, dairy, wheat, soy, fish) can
                typically start once solids are underway, often around 6
                months
              </li>
              <li>
                Introduce one at a time and watch for reactions over the
                following days
              </li>
              <li>
                Talk to your pediatrician first if there&apos;s eczema or a
                family allergy history
              </li>
            </ul>
            <a
              className="source-link"
              href="https://www.healthychildren.org/English/healthy-living/nutrition/Pages/when-to-introduce-egg-peanut-butter-and-other-common-food-allergens-to-your-baby-food-allergy-prevention-tips.aspx"
              target="_blank"
              rel="noopener"
            >
              Source: HealthyChildren.org (AAP) →
            </a>
          </div>
        </div>

        <FoodLog />
      </div>
    </Panel>
  );
}
