using UnityEngine;

public class SetUpBattle : MonoBehaviour
{
    public Player player;
    public Stats[] enemyFabs;
    public Stats[] enemies;
    public Stats[] allyFabs;
    public Stats[] allies;
    public Healthbar[] allybars;
    public Healthbar[] enemybars;
    public Battle battle;
    public void BattleStart()
    {
        player.canMove = false;
        player.transform.position = new Vector3(transform.position.x - 8, 0, 0);
        player.camera.transform.position = new Vector3(transform.position.x - 2, 1, -10);
        player.gameObject.SetActive(false);
        battle.gameObject.SetActive(true);
        for (int i = 0; i < 3; i++)
        {
            GameObject einstance = Instantiate(enemyFabs[i].gameObject, this.transform.position + new Vector3(3 * i, -1, 0), Quaternion.identity);
            enemies[i] = einstance.GetComponent<Stats>();
            enemybars[i].maxHealth = enemies[i].health;
            enemybars[i].SetFill(enemies[i].health);
            GameObject ainstance = Instantiate(allyFabs[i].gameObject, player.transform.position + new Vector3(-2 * (i - 1), 0, 0), Quaternion.identity);
            allies[i] = ainstance.GetComponent<Stats>();
            allybars[i].maxHealth = allies[i].health;
            allybars[i].SetFill(allies[i].health);
        }
        this.gameObject.SetActive(false);
        battle.enemies = enemies;
        battle.allies = allies;
        battle.allybars = allybars;
        battle.enemybars = enemybars;
        battle.SetSkills(0);
        battle.canSkill = true;
    }
}
