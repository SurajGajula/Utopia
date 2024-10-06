using UnityEngine;

public class Battle : MonoBehaviour
{
    public bool canBattle;
    public bool canSkill;
    public Stats[] allies;
    public Stats[] enemies;
    public int chain;
    public void PSkill()
    {
        if (canSkill && chain > 0){
            foreach (Stats enemy in enemies)
            {
                enemy.health -= 10;
            }
        }
        chain -= 1;
        if (chain == 0)
        {
            canSkill = false;
            ESkill();
        }
    }
    public void ESkill()
    {
        foreach (Stats ally in allies)
        {
            ally.health -= 10;
        }
        canSkill = true;
        chain = 3;
    }
}