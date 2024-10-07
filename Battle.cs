using UnityEngine;
using System.Linq;

public class Battle : MonoBehaviour
{
    public bool canSkill;
    public Stats[] allies;
    public Stats[] enemies;
    public Healthbar[] allybars;
    public Healthbar[] enemybars;
    public int chain;
    public Player player;
    public Battle battleUI;
    public void PSkill()
    {
        if (canSkill && chain > 0)
        {
            for (int i = 0; i < 3; i++)
            {
                enemies[i].health -= 10;
                enemybars[i].SetFill(enemies[i].health);
            }
        }
        if (enemies.All(enemy => enemy.health <= 0))
        {
            BattleEnd();
            return;
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
        for (int i = 0; i < 3; i++)
        {
            allies[i].health -= 10;
            allybars[i].SetFill(allies[i].health);
        }
        canSkill = true;
        chain = 3;
    }
    public void BattleEnd()
    {
        chain = 3;
        canSkill = false;
        player.gameObject.SetActive(true);
        player.canMove = true;
        for (int i = 0; i < 3; i++)
        {
            Destroy(enemies[i].gameObject);
            Destroy(allies[i].gameObject);
        }
        gameObject.SetActive(false);
    }
}